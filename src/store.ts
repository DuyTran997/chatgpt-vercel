import { createStore } from "solid-js/store"
import { defaultEnv } from "../shared/env"
import { type ChatMessage, LocalStorageKey } from "../shared/types"
import { batch, createEffect, createMemo, createRoot } from "solid-js"
import { fetchAllSessions, getSession } from "./utils"
import { Fzf } from "fzf"
import type { Model, Option, SimpleModel } from "~/types"
import { countTokensInWorker } from "~/workers"
import { throttle } from "@solid-primitives/scheduled"

let globalSettings = { ...defaultEnv.CLIENT_GLOBAL_SETTINGS }
let _ = import.meta.env.CLIENT_GLOBAL_SETTINGS
if (_) {
  try {
    globalSettings = {
      ...globalSettings,
      ...JSON.parse(_)
    }
  } catch (e) {
    console.error("Error parsing CLIENT_GLOBAL_SETTINGS:", e)
  }
}

let sessionSettings = { ...defaultEnv.CLIENT_SESSION_SETTINGS }
_ = import.meta.env.CLIENT_SESSION_SETTINGS
if (_) {
  try {
    sessionSettings = {
      ...sessionSettings,
      ...JSON.parse(_)
    }
  } catch (e) {
    console.error("Error parsing CLIENT_SESSION_SETTINGS:", e)
  }
}

let maxInputTokens = defaultEnv.CLIENT_MAX_INPUT_TOKENS
_ = import.meta.env.CLIENT_MAX_INPUT_TOKENS
if (_) {
  try {
    if (Number.isNaN(+_)) {
      maxInputTokens = {
        ...maxInputTokens,
        ...JSON.parse(_)
      }
    }
  } catch (e) {
    console.error("Error parsing CLIENT_MAX_INPUT_TOKENS:", e)
  }
}

export const defaultMessage: ChatMessage = {
  role: "assistant",
  content:
    import.meta.env.CLIENT_DEFAULT_MESSAGE || defaultEnv.CLIENT_DEFAULT_MESSAGE,
  type: "default"
}

const models = {
  "gpt-4o": {
    "128k": "gpt-4o-2024-08-06"
  },
  "gpt-4o-mini": {
    "128k": "gpt-4o-mini"
  }
} satisfies {
  [k in SimpleModel]: {
    [k: string]: Model
  }
}

const modelFee = {
  "gpt-4o-mini": {
    input: 0.00015,
    output: 0.0006
  },
  "gpt-4o-2024-08-06": {
    input: 0.0025,
    output: 0.01
  }
} satisfies {
  [key in Model]: {
    input: number
    output: number
  }
}

function Store() {
  const [store, setStore] = createStore({
    sessionId: "index",
    globalSettings,
    sessionSettings,
    inputContent: "",
    messageList: [] as ChatMessage[],
    currentAssistantMessage: "",
    contextToken: 0,
    currentMessageToken: 0,
    inputContentToken: 0,
    loading: false,
    inputRef: null as HTMLTextAreaElement | null,
    get validContext() {
      return validContext()
    },
    get contextToken$() {
      return contextToken$()
    },
    get currentMessageToken$() {
      return currentMessageToken$()
    },
    get inputContentToken$() {
      return inputContentToken$()
    },
    get remainingToken() {
      return remainingToken()
    },
    get currentModel() {
      return currentModel()
    }
  })

  const validContext = createMemo(() =>
    store.sessionSettings.continuousDialogue
      ? store.messageList.filter(
          (k, i, _) =>
            (k.role === "assistant" &&
              k.type !== "temporary" &&
              _[i - 1]?.role === "user") ||
            (k.role === "user" &&
              _[i + 1]?.role !== "error" &&
              _[i + 1]?.type !== "temporary")
        )
      : store.messageList.filter(k => k.type === "locked")
  )

  const throttleCountInputContent = throttle((content: string) => {
    countTokensInWorker(content).then(res => {
      setStore("inputContentToken", res)
    })
  }, 100)

  createEffect(() => {
    store.inputContent
    throttleCountInputContent(store.inputContent)
  })

  const throttleCountContext = throttle((content: string) => {
    countTokensInWorker(content).then(res => {
      setStore("contextToken", res)
    })
  }, 100)

  createEffect(() => {
    store.validContext
    throttleCountContext(store.validContext.map(k => k.content).join("\n"))
  })

  const throttleCountCurrentAssistantMessage = throttle((content: string) => {
    countTokensInWorker(content).then(res => {
      setStore("currentMessageToken", res)
    })
  }, 50)

  createEffect(() => {
    throttleCountCurrentAssistantMessage(store.currentAssistantMessage)
  })

  const remainingToken = createMemo(
    () =>
      (store.globalSettings.APIKey
        ? maxInputTokens[store.sessionSettings.model]
        : defaultEnv.CLIENT_MAX_INPUT_TOKENS[store.sessionSettings.model]) -
      store.contextToken -
      store.inputContentToken
  )

  const currentModel = createMemo(() => {
    const model = store.sessionSettings.model
    switch (model) {
      case "gpt-4o":
        return models["gpt-4o"]["128k"]
      default:
        return models["gpt-4o-mini"]["128k"]
    }
  })

  const inputContentToken$ = createMemo(() =>
    countTokensDollar(store.inputContentToken, store.currentModel, "input")
  )
  const contextToken$ = createMemo(() =>
    countTokensDollar(store.contextToken, store.currentModel, "input")
  )
  const currentMessageToken$ = createMemo(() =>
    countTokensDollar(store.currentMessageToken, store.currentModel, "output")
  )

  return { store, setStore }
}

export const RootStore = createRoot(Store)

export const FZFData = {
  promptOptions: [] as Option[],
  fzfPrompts: undefined as Fzf<Option[]> | undefined,
  sessionOptions: [] as Option[],
  fzfSessions: undefined as Fzf<Option[]> | undefined
}

export function loadSession(id: string) {
  const { store, setStore } = RootStore
  // 只触发一次更新
  batch(() => {
    setStore("sessionId", id)
    try {
      const globalSettings = localStorage.getItem(
        LocalStorageKey.GLOBALSETTINGS
      )
      const session = getSession(id)
      if (globalSettings) {
        const parsed = JSON.parse(globalSettings)
        setStore("globalSettings", t => {
          const s = {
            ...t,
            ...parsed
          }
          if (s.model !== "gpt-4o" && s.model !== "gpt-4o-mini") {
            s.model = "gpt-4o-mini"
          }
          return s
        })
      }
      if (session) {
        const { settings, messages } = session
        if (settings) {
          setStore("sessionSettings", t => {
            const s = {
              ...t,
              ...settings
            }
            if (s.model !== "gpt-4o" && s.model !== "gpt-4o-mini") {
              s.model = "gpt-4o-mini"
            }
            return s
          })
        }
        if (messages) {
          if (store.sessionSettings.saveSession) {
            setStore("messageList", messages)
          } else {
            setStore(
              "messageList",
              messages.filter(m => m.type === "locked")
            )
          }
        }
      }
    } catch {
      console.log("Localstorage parse error")
    }
  })
  setTimeout(() => {
    const seesions = fetchAllSessions()
    FZFData.sessionOptions = seesions
      .sort((m, n) => n.lastVisit - m.lastVisit)
      .filter(k => k.id !== store.sessionId && k.id !== "index")
      .map(k => ({
        title: k.settings.title,
        desc: k.messages.map(k => k.content).join("\n"),
        extra: {
          id: k.id
        }
      }))
    if (id !== "index") {
      FZFData.sessionOptions.unshift({
        title: "Quay Lại Cuộc Trò Chuyện Chính",
        desc:
          "Nhấp vào đầu trang Logo bạn cũng có thể quay lại trực tiếp cuộc trò chuyện chính." +
            seesions
              .find(k => k.id === "index")
              ?.messages.map(k => k.content)
              .join("\n"),
        extra: {
          id: "index"
        }
      })
    }
    FZFData.fzfSessions = new Fzf(FZFData.sessionOptions, {
      selector: k => `${k.title}\n${k.desc}`
    })
  }, 500)
}

function countTokensDollar(
  tokens: number,
  model: Model,
  io: "input" | "output"
) {
  const tk = tokens / 1000
  return modelFee[model][io] * tk
}
