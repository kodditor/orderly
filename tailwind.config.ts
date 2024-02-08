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
          'activeOrders':'50px 1fr 150px 120px',
          'activeOrdersMob': '1fr 100px',
          'productList':'50px 70px 1fr 150px 200px',
          'productListMob': '30px 1fr 100px',
          'orderList': '50px 60px 1fr 150px 100px 175px'
      },
    },
  },
  plugins: [],
}
export default config
