import type { SimpleModel } from "./types"

/**
 * 用于创建 .env.example 文件，不要直接填写敏感信息。
 * 以 CLIENT_ 开头的变量会暴露给前端
 */
export const defaultEnv = {
  CLIENT_GLOBAL_SETTINGS: {
    APIKey: "",
    password: "",
    enterToSend: true
  },
  CLIENT_SESSION_SETTINGS: {
    title: "",
    saveSession: true,
    // 0-2
    APITemperature: 0.6,
    continuousDialogue: true,
    model: "gpt-4o-mini" as SimpleModel
  },
  CLIENT_DEFAULT_MESSAGE: `Powered by Duy Trần
  Ngươi đã bước vào trướng Tào Mạnh Đức, há lại muốn hỏi mà không được đáp? 
  Thiên hạ loạn lạc, kẻ trí phải biết nắm thời cơ, người tài phải biết cầu mưu kế. 
  Có điều chi uẩn khúc trong lòng, cứ nói. 
  Ta – Tào Tháo – tất sẽ vì ngươi mà bày kế, định mưu, mở lối!
  `
  ,
  /*CLIENT_MAX_INPUT_TOKENS: {
    "gpt-4o": 128 * 1000,
    "gpt-4o-mini": 128 * 1000
  } as Record<SimpleModel, number>,*/
  OPENAI_API_BASE_URL: "api.openai.com",
  OPENAI_API_KEY: "",
  TIMEOUT: 30000,
  PASSWORD: "",
  SEND_KEY: "",
  NO_GFW: false
}

export type SessionSettings = typeof defaultEnv.CLIENT_SESSION_SETTINGS
