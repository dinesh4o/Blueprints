import re

with open('src/pages/ReportPage.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace backgrounds
code = code.replace('bg-[#121214]', 'bg-card/40 backdrop-blur-md')
code = code.replace('border-[#27272a]', 'border-border/50')
code = code.replace('bg-[#18181b]', 'bg-muted/40 backdrop-blur-sm')
code = code.replace('bg-[#09090b]', 'bg-background/40 backdrop-blur-xl')
# But fix the main wrappers to be truly transparent so the global radiant effect shows!
code = code.replace('className="min-h-screen bg-background/40 backdrop-blur-xl', 'className="min-h-screen bg-transparent')
code = code.replace('className="flex-1 bg-background/40 backdrop-blur-xl', 'className="flex-1 bg-transparent')
code = code.replace('className="fixed inset-0 z-[100] bg-background/40 backdrop-blur-xl', 'className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-2xl') # The Debate Simulation overlay

with open('src/pages/ReportPage.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
