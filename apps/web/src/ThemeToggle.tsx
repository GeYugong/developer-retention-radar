import { useEffect, useState } from 'react';
import { ModeDarkIcon, ModeLightIcon } from 'tdesign-icons-react';

type Theme = 'light' | 'dark';

function initialTheme():Theme {
  const saved=localStorage.getItem('radar-theme');
  if(saved==='light'||saved==='dark')return saved;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches?'dark':'light';
}

export function ThemeToggle({compact=false}:{compact?:boolean}){
  const [theme,setTheme]=useState<Theme>(initialTheme);
  useEffect(()=>{document.documentElement.dataset.theme=theme;localStorage.setItem('radar-theme',theme)},[theme]);
  const dark=theme==='dark';
  return <button type="button" className={`theme-toggle${compact?' compact-theme':''}`} aria-label={dark?'切换至日间模式':'切换至夜间模式'} title={dark?'切换至日间模式':'切换至夜间模式'} onClick={()=>setTheme(dark?'light':'dark')}>{dark?<ModeLightIcon/>:<ModeDarkIcon/>}{!compact&&<span>{dark?'日间模式':'夜间模式'}</span>}</button>
}
