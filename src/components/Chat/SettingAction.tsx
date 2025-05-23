import { toBlob, toJpeg } from "html-to-image"
import { Match, Show, Switch, type JSXElement } from "solid-js"
import { createStore } from "solid-js/store"
import { defaultEnv } from "~/env"
import { clickOutside } from "~/hooks"
import { RootStore, loadSession } from "~/store"
import type { ChatMessage, SimpleModel } from "~/types"
import {
  copyToClipboard,
  dateFormat,
  delSession,
  generateId,
  getSession,
  isMobile,
  setSession
} from "~/utils"
import { Selector, Switch as SwitchButton } from "../Common"
import { useNavigate } from "@solidjs/router"

export const [actionState, setActionState] = createStore({
  showSetting: "none" as "none" | "global" | "session",
  success: false as false | "markdown" | "link",
  genImg: "normal" as ImgStatusUnion,
  fakeRole: "normal" as FakeRoleUnion,
  clearSessionConfirm: false,
  deleteSessionConfirm: false
})

type ImgStatusUnion = "normal" | "loading" | "success" | "error"
const imgIcons: Record<ImgStatusUnion, string> = {
  success: "i-carbon:status-resolved dark:text-yellow text-yellow-6",
  normal: "i-carbon:image",
  loading: "i-ri:loader-2-line animate-spin",
  error: "i-carbon:warning-alt text-red-6 dark:text-red"
}

export type FakeRoleUnion = "assistant" | "user" | "normal"
const roleIcons: Record<FakeRoleUnion, string> = {
  assistant: "i-ri:android-fill bg-gradient-to-r from-yellow-300 to-red-700 ",
  normal: "i-ri:user-3-line",
  user: "i-ri:user-3-fill bg-gradient-to-r from-red-300 to-blue-700 "
}

export default function SettingAction() {
  const { store, setStore } = RootStore
  const navigator = useNavigate()
  function clearSession() {
    setStore("messageList", messages =>
      messages.filter(k => k.type === "locked")
    )
  }

  // tree shaking
  clickOutside
  return (
    <div
      class="text-sm text-slate-7 dark:text-slate my-2"
      use:clickOutside={() => {
        setActionState("showSetting", "none")
      }}
    >
      <Switch>
        <Match when={actionState.showSetting === "global"}>
          <div class="<sm:max-h-10em max-h-14em overflow-y-auto">
            <Show when={false}>
            <SettingItem icon="i-ri:lock-password-line" label="Nhập Mật Khẩu Trang Web">
              <input
                type="password"
                value={store.globalSettings.password} // <Show when={false}> fix "co che dong mo" doi thanh True neu muon mo lai
                class="input-box"
                onInput={e => {
                  setStore(
                    "globalSettings",
                    "password",
                    (e.target as HTMLInputElement).value
                  )
                }}
              /> 
            </SettingItem>
              </Show>
            <Show when={false}>
            <SettingItem icon="i-carbon:api" label="OpenAI Key">
              <input
                type="password"
                value={store.globalSettings.APIKey}
                class="input-box"
                onInput={e => {
                  setStore(
                    "globalSettings",
                    "APIKey",
                    (e.target as HTMLInputElement).value
                  )
                }}
              />
              
            </SettingItem>
              </Show>
            
            <SettingItem icon="i-carbon:keyboard" label="Enter Đê Gửi Tin Nhắn">
              <SwitchButton
                checked={store.globalSettings.enterToSend}
                onChange={e => {
                  setStore(
                    "globalSettings",
                    "enterToSend",
                    (e.target as HTMLInputElement).checked
                  )
                }}
              />
            </SettingItem>
          </div>
          <hr class="my-1 bg-slate-5 bg-op-15 border-none h-1px"></hr>
        </Match>
        <Match when={actionState.showSetting === "session"}>
          <div class="<sm:max-h-10em max-h-14em overflow-y-auto">
            <Show when={store.sessionId !== "index"}>
              <SettingItem
                icon="i-carbon:text-annotation-toggle"
                label="Cài Đặt Cuộc Trò Chuyện"
              >
                <input
                  type="text"
                  value={store.sessionSettings.title}
                  class="input-box text-ellipsis"
                  onInput={e => {
                    setStore(
                      "sessionSettings",
                      "title",
                      (e.target as HTMLInputElement).value
                    )
                  }}
                />
              </SettingItem>
            </Show>
             <Show when={false}>
            <SettingItem
              icon="i-carbon:machine-learning-model"
              label="OpenAI Mẫu"
            >
              <Selector
                class="max-w-150px"
                value={store.sessionSettings.model}
                onChange={e => {
                  setStore(
                    "sessionSettings",
                    "model",
                    (e.target as HTMLSelectElement).value as SimpleModel
                  )
                }}
                options={[
                  {
                    value: "gpt-4o-mini",
                    label: "gpt-4o-mini"
                  },
                  {
                    value: "gpt-4o",
                    label: "gpt-4o"
                  }
                ]}
              />
            </SettingItem>
                </Show>
             <Show when={false}>
            <SettingItem icon="i-carbon:data-enrichment" label="Suy Nghĩ Khác Biệt">
              <div class="flex items-center justify-between w-150px">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={String(store.sessionSettings.APITemperature * 50)}
                  class="bg-slate max-w-100px w-full h-2 bg-op-15 rounded-lg appearance-none cursor-pointer accent-slate"
                  onInput={e => {
                    setStore(
                      "sessionSettings",
                      "APITemperature",
                      Number((e.target as HTMLInputElement).value) / 50
                    )
                  }}
                />
                <span class="bg-slate bg-op-15 rounded-sm px-1 text-10px">
                  {store.sessionSettings.APITemperature.toFixed(2)}
                </span>
              </div>
            </SettingItem>
                </Show>
            <SettingItem icon="i-carbon:save-image" label="Ghi Âm Cuộc Trò Chuyện">
              <SwitchButton
                checked={store.sessionSettings.saveSession}
                onChange={e => {
                  setStore(
                    "sessionSettings",
                    "saveSession",
                    (e.target as HTMLInputElement).checked
                  )
                }}
              />
            </SettingItem>
            <SettingItem
              icon="i-carbon:3d-curve-auto-colon"
              label="Bắt Đầu Một Cuộc Trò Chuyện Liên Tục"
            >
              <SwitchButton
                checked={store.sessionSettings.continuousDialogue}
                onChange={e => {
                  setStore(
                    "sessionSettings",
                    "continuousDialogue",
                    (e.target as HTMLInputElement).checked
                  )
                }}
              />
            </SettingItem>
          </div>
          <hr class="my-1 bg-slate-5 bg-op-15 border-none h-1px"></hr>
        </Match>
      </Switch>
      <div class="flex items-center justify-between">
        <div class="flex">
          <ActionItem
            onClick={() => {
              setActionState("showSetting", k =>
                k !== "global" ? "global" : "none"
              )
            }}
            icon="i-carbon:settings"
            label="Cài Đặt Chung"
          />
          <ActionItem
            onClick={() => {
              setActionState("showSetting", k =>
                k !== "session" ? "session" : "none"
              )
            }}
            icon="i-carbon:settings-services"
            label="Cài Đặt Hội Thoại"
          />
        </div>
        <Switch
          fallback={
            <div class="flex">
               <Show when={false}>
              <ActionItem
                onClick={() => {
                  setActionState("fakeRole", k => {
                    const _ = ["normal", "user", "assistant"] as FakeRoleUnion[]
                    return _[(_.indexOf(k) + 1) % _.length]
                  })
                }}
                icon={roleIcons[actionState.fakeRole]}
                label="Vai Trò Nhân Vật"
              />
                  </Show>
              <ActionItem
                onClick={async () => {
                  setActionState("genImg", "loading")
                  await exportJpg()
                  setTimeout(() => setActionState("genImg", "normal"), 1000)
                }}
                icon={imgIcons[actionState.genImg]}
                label=" Lưu Đoạn Hội Thoại Dưới Dạng Ảnh"
              />
              <ActionItem
                label="Xuất File MD"
                onClick={async () => {
                  await exportMD(store.messageList)
                  setActionState("success", "markdown")
                  setTimeout(() => setActionState("success", false), 1000)
                }}
                icon={
                  actionState.success === "markdown"
                    ? "i-carbon:status-resolved dark:text-yellow text-yellow-6"
                    : "i-ri:markdown-line"
                }
              />
              <ActionItem
                onClick={() => {
                  if (actionState.clearSessionConfirm) {
                    clearSession()
                    setActionState("clearSessionConfirm", false)
                  } else {
                    setActionState("clearSessionConfirm", true)
                    setTimeout(
                      () => setActionState("clearSessionConfirm", false),
                      3000
                    )
                  }
                }}
                icon={
                  actionState.clearSessionConfirm
                    ? "i-carbon:checkmark animate-bounce text-red-6 dark:text-red"
                    : "i-carbon:clean"
                }
                label={actionState.clearSessionConfirm ? "Chắc chắn Xóa" : "Xóa Cuộc Trò Chuyện Cũ"}
              />
            </div>
          }
        >
          <Match when={actionState.showSetting === "global"}>
            <div class="flex">
              <ActionItem
                label="Xuất File"
                onClick={exportData}
                icon="i-carbon:export"
              />
              <ActionItem
                label="Nhập File"
                onClick={importData}
                icon="i-carbon:download"
              />
            </div>
          </Match>
          <Match when={actionState.showSetting === "session"}>
            <div class="flex">
              <ActionItem
                onClick={() => {
                  let sessionID: string
                  do {
                    sessionID = generateId()
                  } while (getSession(sessionID))
                  setSession(sessionID, {
                    id: sessionID,
                    lastVisit: Date.now(),
                    settings: {
                      ...defaultEnv.CLIENT_SESSION_SETTINGS,
                      title: "Cuộc Trò Chuyện Mới"
                    },
                    messages: []
                  })
                  navigator(`/session/${sessionID}`)
                  loadSession(sessionID)
                }}
                icon="i-carbon:add-alt"
                label="Cuộc Trò Chuyện Mới"
              />
              <Show when={store.sessionId !== "index"}>
                <ActionItem
                  onClick={async () => {
                    await copyToClipboard(
                      window.location.origin + window.location.pathname
                    )
                    setActionState("success", "link")
                    setTimeout(() => setActionState("success", false), 1000)
                  }}
                  icon={
                    actionState.success === "link"
                      ? "i-carbon:status-resolved dark:text-yellow text-yellow-6"
                      : "i-carbon:link"
                  }
                  label="Sao Chép Liên Kết"
                />
                <ActionItem
                  onClick={() => {
                    if (actionState.deleteSessionConfirm) {
                      setActionState("deleteSessionConfirm", false)
                      delSession(store.sessionId)
                      navigator("/", { replace: true })
                      loadSession("index")
                    } else {
                      setActionState("deleteSessionConfirm", true)
                      setTimeout(
                        () => setActionState("deleteSessionConfirm", false),
                        3000
                      )
                    }
                  }}
                  icon={
                    actionState.deleteSessionConfirm
                      ? "i-carbon:checkmark animate-bounce text-red-6 dark:text-red"
                      : "i-carbon:trash-can"
                  }
                  label={actionState.deleteSessionConfirm ? "Chắc chắn" : "Xóa Cuộc Trò Chuyện"}
                />
              </Show>
            </div>
          </Match>
        </Switch>
      </div>
    </div>
  )
}

function SettingItem(props: {
  children: JSXElement
  icon: string
  label: string
}) {
  return (
    <div class="flex items-center p-1 justify-between hover:bg-slate hover:bg-op-10 rounded">
      <div class="flex items-center">
        <button class={props.icon} />
        <span class="ml-1">{props.label}</span>
      </div>
      {props.children}
    </div>
  )
}

function ActionItem(props: { onClick: any; icon: string; label?: string }) {
  return (
    <div
      class="flex items-center cursor-pointer mx-1 p-2 hover:(dark:bg-#23252A bg-#ECF0F4) rounded text-1.2em"
      onClick={props.onClick}
      attr:tooltip={props.label}
      attr:position="top"
    >
      <button class={props.icon} title={props.label} />
    </div>
  )
}

async function exportJpg() {
  try {
    const messageContainer = document.querySelector(
      "#message-container-img"
    ) as HTMLElement
    async function downloadIMG() {
      const url = await toJpeg(messageContainer)
      const a = document.createElement("a")
      a.href = url
      a.download = `ChatGPT-${dateFormat(new Date(), "HH-MM-SS")}.jpg`
      a.click()
    }
    if (!isMobile() && navigator.clipboard) {
      try {
        const blob = await toBlob(messageContainer)
        blob &&
          (await navigator.clipboard.write([
            new ClipboardItem({
              [blob.type]: blob
            })
          ]))
      } catch (e) {
        await downloadIMG()
      }
    } else {
      await downloadIMG()
    }
    setActionState("genImg", "success")
  } catch {
    setActionState("genImg", "error")
  }
}

async function exportMD(messages: ChatMessage[]) {
  const _ = messages.reduce((acc, k) => {
    if (k.role === "assistant" || k.role === "user") {
      if (k.role === "user") {
        acc.push([k])
      } else {
        acc[acc.length - 1].push(k)
      }
    }
    return acc
  }, [] as ChatMessage[][])
  await copyToClipboard(
    _.filter(k => k.length === 2)
      .map(k => {
        return `> ${k[0].content}\n\n${k[1].content}`
      })
      .join("\n\n---\n\n")
  )
}

async function exportData() {
  const a = document.createElement("a")
  a.href = URL.createObjectURL(
    new Blob([JSON.stringify(localStorage)], { type: "application/json" })
  )
  a.download = `ChatGPT-${dateFormat(new Date(), "HH-MM-SS")}.json`
  a.click()
}

async function importData() {
  const input = document.createElement("input")
  input.type = "file"
  input.accept = "application/json"
  input.click()
  input.onchange = async () => {
    const file = input.files?.[0]
    if (file) {
      const text = await file.text()
      const data = JSON.parse(text)
      localStorage.clear()
      Object.keys(data).forEach(k => {
        localStorage.setItem(k, data[k])
      })
      window.location.href = "/"
    }
  }
}
