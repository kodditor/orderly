import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        'peach': '#ffefd378',
        'red': '#E03616',
        'darkRed':'#220901'
      },
      gridTemplateColumns: {
          'activeOrders':'70px 1fr 150px 120px',
          'productList':'100px 70px 1fr 150px 200px',
          'orderList': '100px 70px 1fr 150px 100px 175px'
      },
    },
  },
  plugins: [],
}
export default config
