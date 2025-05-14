import logo from "~/icons/CaocaoLogo.png"   // ?raw
import ThemeToggle from "./ThemeToggle"
import { RootStore, loadSession } from "~/store"
import { Show, createMemo } from "solid-js"
import { useNavigate } from "@solidjs/router"

function splitEmoji(text: string) {
  const [icon, title] = text
    .split(
      /^([\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}])\s*(.+)$/u
    )
    .filter(Boolean)
  if (title)
    return {
      icon,
      title
    }
  return {
    icon: undefined,
    title: icon
  }
}

function scrollTo(selector: string, yOffset = 0) {
  const el = document.querySelector(selector) as HTMLElement
  const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset
  window.scrollTo({ top: y, behavior: "smooth" })
}

export default function Header() {
  const { store } = RootStore
  const navigate = useNavigate()
  const iconTitle = createMemo(() => splitEmoji(store.sessionSettings.title))
  return (
    <>
      <div
        id="logo"
        class="pl-1em cursor-pointer inline-block"
        onClick={() => {
          if (store.sessionId && store.sessionId !== "index") {
            navigate("/", { replace: true })
            loadSession("index")
          }
        }}
      >
        <Show
          when={iconTitle().icon}
          //fallback={<div class="w-8em h-8em" innerHTML={logo} />}
          // Fix to use PNJ
          fallback={<img src={logo} alt="Logo" class="w-8em h-8em" />}
        >
          <div class="text-7em h-1em mb-8">{iconTitle().icon}</div>
        </Show>
      </div>
      <header class="px-4 py-2 sticky top-0 z-99 flex justify-between items-center">
        <div
          class="flex items-center text-2xl cursor-pointer"
          onClick={() => {
            scrollTo("main", -48)
          }}
        >
          <Show
            when={iconTitle().title}
            fallback={
              <>
                <span class="text-transparent text-base sm:text-lg md:text-xl font-extrabold bg-clip-text bg-gradient-to-r dark:from-yellow-300 from-yellow-600 dark:to-red-700 to-red-700 mr-1">
                  Mưu Lược
                </span>
                <span class="ml-1 text-base sm:text-lg md:text-xl font-extrabold text-slate-7 dark:text-slate">
                  Tào Tháo
                </span>
                <a
                  class="ml-2 text-base sm:text-lg md:text-xl <sm:hidden"
                  //href="https://github.com/ourongxing/chatgpt-vercel"
                  // fix
                  href="https://www.youtube.com/@duytranne97"
                >
                  <img
                    //alt="GitHub forks badge"
                    //src="https://img.shields.io/github/stars/ourongxing/chatgpt-vercel?logo=github"
                    src= "https://img.shields.io/youtube/channel/subscribers/UCpslAPh5K9YlEH-vrocz7ww"

                  />
                </a>
                <a
                  class="ml-2 text-base sm:text-lg md:text-xl"
                  //href="https://github.com/ourongxing/chatgpt-vercel/fork"
                  // Fix
                  href="https://www.tiktok.com/@duytranne97?is_from_webapp=1&sender_device=pc"
                >
                  <img
                    //alt="GitHub forks badge"
                    src="https://img.shields.io/badge/TikTok-Profile-blue?style=for-the-badge&logo=tiktok"
                  />
                </a>
              </>
            }
          >
            <span class="ml-1 font-extrabold text-slate-7 dark:text-slate">
              {iconTitle().title}
            </span>
          </Show>
        </div>
        <ThemeToggle />
      </header>
    </>
  )
}
