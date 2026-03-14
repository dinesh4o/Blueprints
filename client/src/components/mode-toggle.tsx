import { Moon, Sun, Settings, UserCircle, LogOut, ChevronRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/components/theme-provider"
import { useAuth } from "@/context/AuthContext"

interface ModeToggleProps {
  variant?: 'basic' | 'full'
}

export function ModeToggle({ variant = 'basic' }: ModeToggleProps) {
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger render={
          <Button variant="outline" size="icon" className="h-12 w-12 rounded-full shadow-lg border-primary/20 bg-background/50 backdrop-blur-md" />
        }>
          <Settings className="h-6 w-6 text-foreground/80 transition-all hover:rotate-90 hover:scale-110" />
          <span className="sr-only">Settings</span>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start" side="top" sideOffset={12}
          className="w-56 rounded-2xl shadow-xl shadow-primary/10 border-border/50 bg-background/90 backdrop-blur-xl p-2"
        >
          <div className="px-2 py-1.5 text-sm font-semibold">Settings</div>
          <DropdownMenuSeparator className="bg-border/50" />

          {/* Full variant: user card + edit profile */}
          {variant === 'full' && user && (
            <>
              <div className="px-2 py-2 flex items-center gap-3">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <UserCircle className="w-5 h-5 text-primary" />
                  </div>
                )}
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold truncate">{user.name}</span>
                  <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                </div>
              </div>
              <DropdownMenuSeparator className="bg-border/50" />
              <div className="p-1">
                <DropdownMenuItem
                  onClick={() => navigate('/profile/edit')}
                  className="rounded-lg cursor-pointer gap-2"
                >
                  <UserCircle className="h-4 w-4" />
                  <span>Edit Profile</span>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator className="bg-border/50" />
            </>
          )}

          {/* Theme section — always shown */}
          <div className="p-1 space-y-0.5">
            <span className="text-xs text-muted-foreground px-2 font-medium mb-1 block uppercase tracking-wider">Theme</span>
            <DropdownMenuItem
              onClick={() => setTheme("light")}
              className={`rounded-lg cursor-pointer gap-2 ${theme === 'light' ? 'bg-primary/10 text-primary' : ''}`}
            >
              <Sun className="h-4 w-4" />
              <span>Light</span>
              {theme === 'light' && <ChevronRight className="ml-auto h-3 w-3" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTheme("dark")}
              className={`rounded-lg cursor-pointer gap-2 ${theme === 'dark' ? 'bg-primary/10 text-primary' : ''}`}
            >
              <Moon className="h-4 w-4" />
              <span>Dark</span>
              {theme === 'dark' && <ChevronRight className="ml-auto h-3 w-3" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTheme("system")}
              className={`rounded-lg cursor-pointer gap-2 ${theme === 'system' ? 'bg-primary/10 text-primary' : ''}`}
            >
              <Settings className="h-4 w-4" />
              <span>System</span>
              {theme === 'system' && <ChevronRight className="ml-auto h-3 w-3" />}
            </DropdownMenuItem>
          </div>

          {/* Full variant: sign out */}
          {variant === 'full' && user && (
            <>
              <DropdownMenuSeparator className="bg-border/50" />
              <div className="p-1">
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="rounded-lg cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
