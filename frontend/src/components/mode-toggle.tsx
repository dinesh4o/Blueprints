import { Settings, LogOut, UserCircle, Zap, FolderOpen } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/AuthContext"

export function ModeToggle() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [avatarError, setAvatarError] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const initials = (user?.name || user?.email || 'U').charAt(0).toUpperCase()
  const showAvatar = user?.avatar && !avatarError

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" size="icon" className="h-12 w-12 rounded-full shadow-lg border-primary/20 bg-background/80 backdrop-blur-md overflow-hidden p-0" />}>
          {showAvatar ? (
            <img src={user!.avatar} alt="" className="h-full w-full object-cover" onError={() => setAvatarError(true)} />
          ) : user ? (
            <span className="h-full w-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
              {initials}
            </span>
          ) : (
            <Settings className="h-6 w-6 text-foreground/80 transition-all hover:rotate-90 hover:scale-110" />
          )}
          <span className="sr-only">Settings</span>
        </DropdownMenuTrigger>

          <DropdownMenuContent align="start" side="top" sideOffset={12} className="w-56 rounded-2xl shadow-xl shadow-primary/10 border-border/50 bg-background/95 backdrop-blur-xl p-2">

            {user && (
              <>
                {/* User info header */}
                <div className="px-2 py-2 flex items-center gap-3">
                  {showAvatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name || user.email}
                      className="h-9 w-9 rounded-full object-cover ring-2 ring-primary/20 shrink-0"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-base ring-2 ring-primary/20 shrink-0">
                      {initials}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{user.name || 'User'}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-border/50" />

                <div className="p-1">
                  <DropdownMenuItem onClick={() => navigate('/profile')} className="rounded-lg cursor-pointer">
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Edit Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/portfolio')} className="rounded-lg cursor-pointer">
                    <FolderOpen className="mr-2 h-4 w-4" />
                    <span>My Reports</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { navigate('/'); setTimeout(() => document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' }), 300); }} className="rounded-lg cursor-pointer">
                    <Zap className="mr-2 h-4 w-4" />
                    <span>Explore Plans</span>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator className="bg-border/50" />
              </>
            )}


            {user && (
              <>
                <DropdownMenuSeparator className="bg-border/50" />
                <div className="p-1">
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="rounded-lg cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
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
