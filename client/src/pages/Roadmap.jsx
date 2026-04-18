import { useState } from 'react';

/* ── SVG icon components (professional, no emojis) ─────────────────────────── */
const icons = {
    crop: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
    ),
    microscope: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
    ),
    water: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        </svg>
    ),
    alert: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
    ),
    chart: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
    ),
    currency: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    trend: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
        </svg>
    ),
    map: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
    ),
    clipboard: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
        </svg>
    ),
    beaker: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 5.287c.093.35-.06.718-.377.897A20.185 20.185 0 0112 23.144a20.185 20.185 0 01-8.825-1.66.556.556 0 01-.377-.897L5 14.5" />
        </svg>
    ),
    globe: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
    ),
    document: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
    ),
    star: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
    ),
    cart: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
        </svg>
    ),
    megaphone: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
        </svg>
    ),
    tag: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
        </svg>
    ),
    truck: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.029-.394 1.029-.938V14.25M3.375 7.5h10.5c.621 0 1.125.504 1.125 1.125v4.5m4.5 0V8.625c0-.621-.504-1.125-1.125-1.125h-2.736a1.125 1.125 0 00-.89.438l-1.35 1.688a1.125 1.125 0 01-.89.437H15" />
        </svg>
    ),
    phone: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
        </svg>
    ),
    brain: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
    ),
    shield: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
    ),
    users: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
    ),
    bank: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
        </svg>
    ),
    handshake: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
        </svg>
    ),
    building: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
        </svg>
    ),
    satellite: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.348 14.651a3.75 3.75 0 010-5.303m5.304 0a3.75 3.75 0 010 5.303m-7.425 2.122a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.808-3.808-9.98 0-13.789m13.788 0c3.808 3.808 3.808 9.981 0 13.79M12 12h.008v.008H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
    ),
    microphone: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
        </svg>
    ),
    academic: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
        </svg>
    ),
    earthGlobe: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.893 13.393l-1.135-1.135a2.252 2.252 0 01-.421-.585l-1.08-2.16a.414.414 0 00-.663-.107.827.827 0 01-.812.21l-1.273-.363a.89.89 0 00-.738 1.595l.587.39c.59.395.674 1.23.172 1.732l-.2.2c-.212.212-.33.498-.33.796v.41c0 .409-.11.809-.32 1.158l-1.315 2.191a2.11 2.11 0 01-1.81 1.025 1.055 1.055 0 01-1.055-1.055v-1.172c0-.92-.56-1.747-1.414-2.089l-.655-.261a2.25 2.25 0 01-1.383-2.46l.007-.042a2.25 2.25 0 01.29-.787l.09-.15a2.25 2.25 0 012.37-1.048l1.178.236a1.125 1.125 0 001.302-.795l.208-.73a1.125 1.125 0 00-.578-1.315l-.665-.332-.091.091a2.25 2.25 0 01-1.591.659h-.18c-.249 0-.487.1-.662.274a.931.931 0 01-1.458-1.137l1.411-2.353a2.25 2.25 0 00.286-.76m11.928 9.869A9 9 0 008.965 3.525m11.928 9.868A9 9 0 118.965 3.525" />
        </svg>
    ),
    revenue: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
        </svg>
    ),
};

/* ── Phase data ────────────────────────────────────────────────────────────── */
const phases = [
    {
        phase: 'Phase 1 — Current Release',
        status: 'live',
        statusLabel: 'Live Now',
        description: 'Core smart farming features powering KrishiMitra today.',
        items: [
            { title: 'AI Crop Recommendation Engine', desc: 'Analyzes soil NPK levels, pH, temperature, humidity, and rainfall data to intelligently recommend the best-matching crops for any given field. Each recommendation includes a confidence score, ideal growing conditions, and seasonal suitability.', icon: 'crop' },
            { title: 'Plant Disease Detection (AI/ML)', desc: 'Farmers upload or capture a leaf image, and a MobileNetV2 deep learning model processes it in real-time to identify plant diseases with confidence scores. Each diagnosis includes detailed treatment recommendations and preventive measures.', icon: 'microscope' },
            { title: 'Smart Irrigation Scheduler', desc: 'Generates optimized daily watering schedules by factoring in crop water requirements, soil moisture retention capacity, current weather conditions, and rainfall forecasts — helping farmers reduce water waste by up to 30%.', icon: 'water' },
            { title: 'Pest & Disease Alerts', desc: 'Continuously monitors weather conditions and cross-references with crop-specific pest vulnerability data to issue proactive warnings. Alerts include severity levels (low/medium/high), affected crop guidance, and recommended preventive actions.', icon: 'alert' },
            { title: 'Yield & Harvest Prediction', desc: 'Estimates expected crop yield per acre based on soil quality, weather patterns, and historical regional data. Also recommends the optimal harvest window to maximize output and minimize post-harvest losses.', icon: 'chart' },
            { title: 'Market Prices (Live API)', desc: 'Fetches real-time commodity prices from the Agmarknet government database, covering thousands of agricultural markets across India. Farmers can compare prices across multiple mandis to find the best selling opportunity.', icon: 'currency' },
            { title: 'Price Forecast & Trends', desc: 'Analyzes historical price movements for key crops and generates trend visualizations with actionable sell/hold recommendations, helping farmers time their market entry for maximum profit.', icon: 'trend' },
            { title: 'Farm Management & Map', desc: 'Allows farmers to register multiple farms with detailed profiles including soil type, crop rotation history, GPS coordinates, and area measurements. All farms are visualized on an interactive map for easy management.', icon: 'map' },
            { title: 'Crop & Fertilizer Advisory', desc: 'Provides personalized fertilizer recommendations based on soil nutrient readings (NPK, pH) combined with real-time weather data. Advisories include specific dosage guidelines and application timing for optimal results.', icon: 'clipboard' },
            { title: 'Soil Test Lab Locator', desc: 'Helps farmers locate the nearest government and private soil testing laboratories. Includes detailed directions, sample collection guidelines, and information about available testing services.', icon: 'beaker' },
            { title: 'Multi-language Support', desc: 'The platform is fully accessible in English, Hindi, and Telugu, ensuring usability for farmers across different regions of India regardless of language preference.', icon: 'globe' },
            { title: 'Reports & PDF/CSV Export', desc: 'All farming data, advisory reports, disease detection history, and recommendations can be downloaded as professional PDF or CSV documents for record-keeping, loan applications, or sharing with agricultural officers.', icon: 'document' },
        ],
    },
    {
        phase: 'Phase 2 — Monetization & Growth',
        status: 'next',
        statusLabel: 'Coming Soon',
        description: 'Revenue-generating features to make KrishiMitra a sustainable agri-tech business.',
        items: [
            {
                title: 'Freemium Subscription (Pro Plan)',
                desc: 'A tiered pricing model where the free tier provides access to 1 farm profile, 3 AI disease scans per month, and basic crop advisory. The Pro tier (₹99–299/month or ₹999/year) unlocks unlimited farm profiles, unlimited AI-powered disease scans, advanced yield analytics, priority weather alerts, and comprehensive PDF reporting.',
                icon: 'star',
                revenue: 'Recurring subscription revenue',
            },
            {
                title: 'Agri-Input Marketplace',
                desc: 'A built-in e-commerce platform where verified seed companies, fertilizer manufacturers, and pesticide brands can list their products. Farmers browse, compare, and purchase inputs directly with doorstep delivery. The platform earns a 5–15% commission on every transaction, creating a scalable revenue stream.',
                icon: 'cart',
                revenue: 'Transaction commission (5–15%)',
            },
            {
                title: 'Contextual Agri-Input Advertising',
                desc: 'Intelligent ad placement that shows relevant product recommendations at the right moment. For example, when a farmer receives a pest alert for aphids, the platform suggests verified pesticide products from partner brands. This native advertising approach delivers high conversion rates while being genuinely helpful to farmers.',
                icon: 'megaphone',
                revenue: 'CPM/CPC advertising revenue',
            },
            {
                title: 'Soil Lab Premium Listings',
                desc: 'Soil testing laboratories can pay for featured placement in the Lab Locator, gaining priority visibility, a verified badge, and lead generation analytics. Labs receive customer contact forwarding and booking management tools, creating a steady B2B revenue channel.',
                icon: 'tag',
                revenue: '₹500–2,000/month per lab listing',
            },
            {
                title: 'Equipment Rental Marketplace',
                desc: 'Tractor, drone, sprayer, and harvester owners list their equipment for hourly or daily rental. Small-scale farmers who cannot afford to purchase expensive machinery can book equipment on-demand through the platform, while owners monetize idle assets. The platform earns a 10% booking commission.',
                icon: 'truck',
                revenue: 'Booking commission (10%)',
            },
            {
                title: 'SMS & WhatsApp Push Alerts',
                desc: 'A paid notification service for farmers in areas with limited internet connectivity. Subscribers receive critical pest alerts, irrigation reminders, and market price updates directly via SMS or WhatsApp. This ensures no farmer misses time-sensitive information, even without constant app access.',
                icon: 'phone',
                revenue: '₹49/month per subscriber',
            },
        ],
    },
    {
        phase: 'Phase 3 — Data Intelligence & B2B',
        status: 'planned',
        statusLabel: 'Planned',
        description: 'Leveraging aggregated farm data for enterprise partnerships and institutional revenue.',
        items: [
            {
                title: 'Aggregated Market Intelligence',
                desc: 'With thousands of farms generating data on crop choices, yield outcomes, and regional conditions, KrishiMitra can provide anonymized, aggregated intelligence reports to agri-businesses, FMCG companies, commodity traders, and government research bodies — helping them make better supply chain and policy decisions.',
                icon: 'brain',
                revenue: 'Enterprise data licensing',
            },
            {
                title: 'Crop Insurance Partnerships',
                desc: 'By partnering with crop insurance providers, KrishiMitra can share verified crop health data (with explicit farmer consent) to enable faster claim processing and more accurate risk assessment. The platform earns a referral fee for every policy facilitated, while farmers get access to better-priced insurance products.',
                icon: 'shield',
                revenue: 'Per-policy referral fee',
            },
            {
                title: 'FPO & Cooperative Dashboards',
                desc: 'Farmer Producer Organizations and agricultural cooperatives need tools to manage hundreds of member farms at scale. This enterprise dashboard enables bulk farm monitoring, aggregated yield tracking, coordinated market sales, and collective bargaining — all from a single interface. Priced as a monthly SaaS subscription per organization.',
                icon: 'users',
                revenue: '₹5,000–20,000/month per FPO',
            },
            {
                title: 'Credit & Loan Facilitation',
                desc: 'Partnering with banks, NBFCs, and microfinance institutions to use verified farm data (yield history, crop health records, market income) as a digital credit profile. This helps farmers access Kisan Credit Cards (KCC) and crop loans with better interest rates, while the platform earns a per-disbursement referral fee.',
                icon: 'bank',
                revenue: 'Per-disbursement referral fee',
            },
            {
                title: 'Mandi Direct Connect',
                desc: 'A direct farmer-to-buyer marketplace that eliminates traditional middlemen in the agricultural supply chain. Farmers list their harvest with quantity, quality grade, and asking price. Verified wholesale buyers and retailers bid directly. Farmers typically earn 15–20% more than mandi prices, while the platform takes a 2–5% facilitation fee.',
                icon: 'handshake',
                revenue: 'Transaction fee (2–5%)',
            },
        ],
    },
    {
        phase: 'Phase 4 — Scale & National Impact',
        status: 'vision',
        statusLabel: 'Vision',
        description: 'Scaling KrishiMitra into a nationwide agricultural platform with advanced technology integration.',
        items: [
            {
                title: 'Government & State Contracts',
                desc: 'White-labeling the platform for state agriculture departments and central government schemes. State governments can deploy a customized version of KrishiMitra to all registered farmers in a district or state, providing subsidized access to AI-powered advisory, market intelligence, and disease detection at population scale.',
                icon: 'building',
                revenue: 'Annual licensing contracts',
            },
            {
                title: 'Satellite & Drone Integration',
                desc: 'Integrating satellite imagery (NDVI vegetation indices) and drone-captured multispectral field data for precision agriculture. This enables real-time crop health monitoring at individual field level, early drought/flood detection, and automated damage assessment for insurance claims — without requiring farmers to manually inspect fields.',
                icon: 'satellite',
                revenue: 'Premium analytics subscription',
            },
            {
                title: 'AI-Powered Voice Assistant',
                desc: 'A conversational voice interface in regional Indian languages that allows farmers to interact with KrishiMitra hands-free. Farmers can ask natural-language questions like "When should I irrigate my rice field?" or "What is today\'s tomato price in Hyderabad?" and receive instant audio responses — making the platform accessible even to non-literate users.',
                icon: 'microphone',
                revenue: 'Included in Pro subscription',
            },
            {
                title: 'Farming Training Courses',
                desc: 'A library of certified video courses developed in partnership with agricultural universities and KVKs (Krishi Vigyan Kendras) covering modern farming techniques, organic certification processes, post-harvest management, government scheme applications, and sustainable agriculture practices.',
                icon: 'academic',
                revenue: '₹199–499 per course',
            },
            {
                title: 'NGO & CSR Partnership Programs',
                desc: 'Collaborating with agricultural NGOs, international development organizations, and corporate CSR initiatives that fund technology platforms serving smallholder farmers. These partnerships provide project-based funding while expanding KrishiMitra\'s reach to underserved farming communities across rural India.',
                icon: 'earthGlobe',
                revenue: 'Project-based grants',
            },
        ],
    },
];

const statusStyles = {
    live: { ring: 'ring-[#059669]/20', cardBorder: 'border-[#059669]/20', headerBg: 'bg-gradient-to-r from-[#065f46] to-[#059669]', iconBg: 'bg-[#ecfdf5] text-[#065f46]' },
    next: { ring: 'ring-[#d97706]/20', cardBorder: 'border-[#d97706]/20', headerBg: 'bg-gradient-to-r from-[#92400e] to-[#d97706]', iconBg: 'bg-amber-50 text-amber-700' },
    planned: { ring: 'ring-[#2563eb]/20', cardBorder: 'border-[#2563eb]/20', headerBg: 'bg-gradient-to-r from-[#1e40af] to-[#2563eb]', iconBg: 'bg-blue-50 text-blue-700' },
    vision: { ring: 'ring-[#7c3aed]/20', cardBorder: 'border-[#7c3aed]/20', headerBg: 'bg-gradient-to-r from-[#5b21b6] to-[#7c3aed]', iconBg: 'bg-purple-50 text-purple-700' },
};

const revenueCategoryIcons = {
    Subscriptions: icons.star,
    Marketplace: icons.cart,
    Advertising: icons.megaphone,
    'Data Licensing': icons.brain,
    Partnerships: icons.handshake,
    'Govt. Contracts': icons.building,
};

const Roadmap = () => {
    const [expandedPhase, setExpandedPhase] = useState(0);

    return (
        <div className="page-content">
            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#065f46] via-[#059669] to-[#0d9488] p-8 md:p-12 mb-10">
                <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4" />
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-xs font-semibold text-white/90 border border-white/20 flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            Product Roadmap
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-3">
                        Future Vision & Revenue Model
                    </h1>
                    <p className="text-base md:text-lg text-white/80 max-w-2xl leading-relaxed">
                        From a smart farming platform to a comprehensive agricultural ecosystem — our roadmap for scaling KrishiMitra into a sustainable, revenue-generating agri-tech business serving millions of Indian farmers.
                    </p>
                    <div className="flex flex-wrap gap-6 mt-8">
                        {[
                            { label: 'Current Features', value: '12+', sub: 'AI-powered tools' },
                            { label: 'Revenue Streams', value: '10+', sub: 'Monetization paths' },
                            { label: 'Target Users', value: '14.6Cr', sub: 'Indian farmers' },
                            { label: 'Market Size', value: '₹1.2L Cr', sub: 'Indian agri-tech' },
                        ].map((stat) => (
                            <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/15">
                                <p className="text-2xl font-extrabold text-white">{stat.value}</p>
                                <p className="text-xs text-white/70 font-medium">{stat.label}</p>
                                <p className="text-[10px] text-white/50">{stat.sub}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Revenue Summary Bar */}
            <div className="glass-card rounded-2xl p-6 mb-8">
                <h3 className="text-sm font-bold text-[#1a2e2a] mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-[#ecfdf5] flex items-center justify-center text-[#065f46]">
                        {icons.revenue}
                    </span>
                    Revenue Model Summary
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {[
                        { name: 'Subscriptions', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                        { name: 'Marketplace', color: 'bg-orange-50 text-orange-700 border-orange-200' },
                        { name: 'Advertising', color: 'bg-blue-50 text-blue-700 border-blue-200' },
                        { name: 'Data Licensing', color: 'bg-purple-50 text-purple-700 border-purple-200' },
                        { name: 'Partnerships', color: 'bg-pink-50 text-pink-700 border-pink-200' },
                        { name: 'Govt. Contracts', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
                    ].map((stream) => (
                        <div key={stream.name} className={`rounded-xl border px-3 py-3 flex flex-col items-center gap-1.5 ${stream.color}`}>
                            {revenueCategoryIcons[stream.name]}
                            <span className="text-xs font-semibold">{stream.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Phase Timeline */}
            <div className="space-y-6">
                {phases.map((phase, phaseIdx) => {
                    const style = statusStyles[phase.status];
                    const isExpanded = expandedPhase === phaseIdx;

                    return (
                        <div key={phase.phase} className="relative">
                            {phaseIdx < phases.length - 1 && (
                                <div className="absolute left-6 top-[72px] bottom-0 w-0.5 bg-gray-200 z-0 hidden md:block" />
                            )}

                            <button
                                onClick={() => setExpandedPhase(isExpanded ? -1 : phaseIdx)}
                                className={`w-full relative z-10 rounded-2xl overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-2 ' + style.ring : ''}`}
                            >
                                <div className={`${style.headerBg} p-5 md:p-6 flex items-center justify-between`}>
                                    <div className="flex items-center gap-4 text-left">
                                        <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white font-extrabold text-lg border border-white/20">
                                            {phaseIdx + 1}
                                        </div>
                                        <div>
                                            <h2 className="text-lg md:text-xl font-bold text-white">{phase.phase}</h2>
                                            <p className="text-sm text-white/70 mt-0.5">{phase.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 ${phase.status === 'live' ? 'bg-white text-[#065f46]' : 'bg-white/20 text-white'} text-xs font-bold rounded-full border border-white/30 hidden sm:inline-block`}>
                                            {phase.statusLabel}
                                        </span>
                                        <span className="text-xs text-white/60 font-medium">{phase.items.length} features</span>
                                        <svg className={`w-5 h-5 text-white/70 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </button>

                            {isExpanded && (
                                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 animate-fade-in">
                                    {phase.items.map((item, itemIdx) => (
                                        <div
                                            key={item.title}
                                            className={`glass-card rounded-2xl p-5 border-l-4 ${style.cardBorder} hover:shadow-md transition-all duration-200 stagger-${Math.min(itemIdx + 1, 6)}`}
                                        >
                                            <div className="flex items-start gap-3.5">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${style.iconBg}`}>
                                                    {icons[item.icon]}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-bold text-[#1a2e2a] mb-1.5">{item.title}</h4>
                                                    <p className="text-xs text-[#4b6360] leading-relaxed">{item.desc}</p>
                                                    {item.revenue && (
                                                        <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#ecfdf5] rounded-lg border border-[#d1fae5]">
                                                            {icons.revenue}
                                                            <span className="text-[11px] font-semibold text-[#065f46]">{item.revenue}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Bottom CTA */}
            <div className="mt-12 glass-card rounded-2xl p-8 text-center">
                <div className="max-w-lg mx-auto">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#065f46] to-[#059669] flex items-center justify-center mx-auto mb-4">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-extrabold text-[#1a2e2a] mb-2">Built for India's Farmers</h3>
                    <p className="text-sm text-[#4b6360] leading-relaxed">
                        KrishiMitra aims to empower 14.6 crore Indian farmers with AI-driven insights, real-time market intelligence, and seamless financial access — transforming every smartphone into a powerful smart farming tool.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Roadmap;
