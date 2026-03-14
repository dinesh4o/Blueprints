import { Moon, Sun, Settings } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/components/theme-provider"

export function ModeToggle() {
  const { setTheme } = useTheme()

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" size="icon" className="h-12 w-12 rounded-full shadow-lg border-primary/20 bg-background/50 backdrop-blur-md" />}>
          <Settings className="h-6 w-6 text-foreground/80 transition-all hover:rotate-90 hover:scale-110" />
          <span className="sr-only">Settings</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="top" sideOffset={12} className="w-56 rounded-2xl shadow-xl shadow-primary/10 border-border/50 bg-background/80 backdrop-blur-xl p-2">
          <DropdownMenuLabel className="px-2 py-1.5 text-sm font-semibold">Settings</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-border/50" />
          <div className="p-2 space-y-1">
            <span className="text-xs text-muted-foreground px-2 font-medium mb-2 block">Theme</span>
            <DropdownMenuItem onClick={() => setTheme("light")} className="rounded-lg cursor-pointer">
              <Sun className="mr-2 h-4 w-4" />
              <span>Light</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")} className="rounded-lg cursor-pointer">
              <Moon className="mr-2 h-4 w-4" />
              <span>Dark</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")} className="rounded-lg cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>System</span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
