import * as React from "react"
import { cn } from "@/lib/utils"

export interface ShaderButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

export const ShaderButton = React.forwardRef<HTMLButtonElement, ShaderButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "relative group overflow-hidden rounded-full px-8 py-3 transition-transform hover:scale-[1.02] active:scale-95",
          "bg-zinc-950 text-zinc-100 font-medium",
          className
        )}
        {...props}
      >
        <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none overflow-hidden rounded-full">
          <div className="absolute -inset-[200%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_0deg_at_50%_50%,rgba(212,212,216,0)_0%,rgba(212,212,216,0.15)_25%,rgba(212,212,216,0)_50%,rgba(212,212,216,0.15)_75%,rgba(212,212,216,0)_100%)] blur-md mix-blend-screen" />
        </div>
        
        <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#3F3F46_0%,#E2E8F0_50%,#3F3F46_100%)] opacity-40 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />
        
        <span className="absolute inset-[1px] rounded-full bg-zinc-950 backdrop-blur-xl transition-colors duration-500 group-hover:bg-zinc-900/90 z-10" />

        <span className="relative z-20 flex items-center justify-center gap-2 tracking-wide w-full h-full">
          {children}
        </span>
      </button>
    )
  }
)
ShaderButton.displayName = "ShaderButton"

