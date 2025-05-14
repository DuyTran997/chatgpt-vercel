import logo from "~/icons/CaocaoLogo.png"   // ?raw
import coverImage from "~/public/TaoThaoJPG.jpg"
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
 <div class="relative w-full h-32 sm:h-48 md:h-56 lg:h-64 mb-4">
  {/* Ảnh cover nền phía sau */}
  <img
    src={coverImage}
    alt="Cover"
    class="absolute inset-0 w-full h-full object-cover"
  />
  
  {/* Logo nằm trên ảnh */}
  <div
    id="logo"
    class="absolute left-4 bottom-4 cursor-pointer"
    onClick={() => {
      if (store.sessionId && store.sessionId !== "index") {
        navigate("/", { replace: true })
        loadSession("index")
      }
    }}
  >
    <Show
      when={iconTitle().icon}
      fallback={<img src={logo} alt="Logo" class="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 drop-shadow-md" />}
    >
      <div class="text-5xl sm:text-6xl mb-2 drop-shadow-md">{iconTitle().icon}</div>
    </Show>
  </div>
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
              <div class="inline-block">
               <span class="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-600 
               to-red-700 text-base sm:text-lg md:text-xl font-extrabold whitespace-nowrap">
               Mưu Lược Tào Tháo
               </span>
               <div class="text-xs sm:text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r 
               from-yellow-600 to-red-600 dark:from-yellow-300 dark:to-red-500 whitespace-nowrap">
               Powered By Duy Trần
              </div>
              </div>
               
                <a
                  class="ml-2 text-base sm:text-lg md:text-xl"
                  //href="https://github.com/ourongxing/chatgpt-vercel"
                  // fix
                  href="https://www.youtube.com/@duytranne97"
                >
                  <img
                    //alt="GitHub forks badge"
                    //src="https://img.shields.io/github/stars/ourongxing/chatgpt-vercel?logo=github"
                    src= "https://img.shields.io/youtube/channel/subscribers/UCpslAPh5K9YlEH-vrocz7ww"
                    alt="YouTube Subscribers"
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
