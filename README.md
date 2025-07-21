1. I assume that u have apps/web for frontend and u have packages
2. Now create one folder named `tailwind-config` inside packages
3. create package.json and paste following json code:
```json
{
  "name": "@repo/tailwind-config",
  "version": "0.0.0",
  "type": "module",
  "private": true,
  "exports": {
    "./postcss": "./postcss.config.js"
  },
  "devDependencies": {
    "postcss": "^8.5.3",
    "tailwindcss": "^4.1.5"
  }
}
```

4. Then create a file named `postcss.config.js`, and paste following code:

```js
// Optional PostCSS configuration for applications that need it
export const postcssConfig = {
    plugins: {
        "@tailwindcss/postcss": {},
    },
};
```

5. Then come to root, and run "pnpm install" or "npm install"(depends on which package manager u are using)
6. Go to ur frontend app, apps/web
7. Open `package.json` and in dependencies, add following line:

```json
"@repo/tailwind-config": "workspace:*"   # if u are using pnpm
or
"@repo/tailwind-config": "*"   # if u are using npm
```
8. Then run following in apps/webs: `pnpm (or npm) install tailwindcss @tailwindcss/postcss postcss`
9. Also run `pnpm install` or `npm install`
10. Then create `postcss.config.js` inside apps/web, and paste following code:
```js
import { postcssConfig } from "@repo/tailwind-config/postcss";

export default postcssConfig;

```
11. Go to apps/web/app/globals.css and paste following code:

```css
@import "tailwindcss";
```

12. All set, now run `pnpm run dev` or `npm run dev`, and check if tailwind css is working or not