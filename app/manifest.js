export default function manifest() {
  return {
    name: 'Personal Budget',
    short_name: 'Budget',
    description: 'Personal budget tracker',
    start_url: '/',
    display: 'standalone',
    background_color: '#f9f9f7',
    theme_color: '#2a78d6',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
