import re

# 1. Sidebar
with open('src/components/Sidebar/index.tsx', 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace('const { activePanel, setActivePanel }', 'const { activePanel: _activePanel, setActivePanel }')
content = content.replace('activePanel === item.id', '_activePanel === item.id')
with open('src/components/Sidebar/index.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Sidebar done')

# 2. ResearchImproveHub
with open('src/components/panels/ResearchImproveHub/index.tsx', 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace('function TabButton({ active, onClick, icon, label }: any)', 'function TabButton({ active: _active, onClick, icon, label }: any)')
content = content.replace('active ? ', '_active ? ')
content = content.replace('function ResearchPanel({ isDark }: any)', 'function ResearchPanel({ isDark: _isDark }: any)')
content = content.replace('function ImprovePanel({ isDark }: any)', 'function ImprovePanel({ isDark: _isDark }: any)')
content = content.replace('isDark ? ', '_isDark ? ')
with open('src/components/panels/ResearchImproveHub/index.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('ResearchImproveHub done')

# 3. SyncPanel
with open('src/components/panels/SyncPanel/index.tsx', 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace('const _settings = useSyncStore();', '// const settings = useSyncStore(); // kullanilmiyor')
with open('src/components/panels/SyncPanel/index.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('SyncPanel done')

print('All done!')
