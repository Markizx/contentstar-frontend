import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

// Убедимся, что NEXTAUTH_URL всегда используется
if (!process.env.NEXTAUTH_URL) {
    throw new Error('NEXTAUTH_URL is not set');
}

// Явно задаём baseUrl из NEXTAUTH_URL
const baseUrl = process.env.NEXTAUTH_URL;

export default async function auth(req, res) {
    // Отладка: выведем NEXTAUTH_URL и заголовки
    console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
    console.log('Base URL (before):', baseUrl);
    console.log('Request Headers:', req.headers);
    console.log('Host Header:', req.headers.host);
    console.log('Protocol:', req.headers['x-forwarded-proto'] || 'http');
    console.log('Full URL:', `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}`);

    // Проверяем куки и очищаем next-auth.callback-url, если он содержит localhost:3000
    const cookies = req.headers.cookie || '';
    console.log('Cookies before cleaning:', cookies);
    if (cookies.includes('next-auth.callback-url')) {
        console.log('Found next-auth.callback-url in cookies, clearing...');
        res.setHeader('Set-Cookie', [
            'next-auth.callback-url=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; HttpOnly; SameSite=Strict',
            '__Secure-next-auth.callback-url=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; HttpOnly; SameSite=Strict',
        ]);
    }

    // Перехватываем редиректы
    const originalRedirect = res.redirect;
    res.redirect = (status, url) => {
        console.log('Redirect attempt:', status, url);
        if (url.includes('localhost:3000')) {
            const newUrl = url.replace('http://localhost:3000', process.env.NEXTAUTH_URL);
            console.log('Redirect corrected to:', newUrl);
            return originalRedirect.call(res, status, newUrl);
        }
        return originalRedirect.call(res, status, url);
    };

    // Создаём конфигурацию NextAuth
    const nextAuthConfig = {
        providers: [
            GoogleProvider({
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                authorization: {
                    params: {
                        redirect_uri: `${baseUrl}/api/auth/callback/google`,
                    },
                },
            }),
        ],
        secret: process.env.NEXTAUTH_SECRET,
        callbacks: {
            async redirect({ url, baseUrl }) {
                console.log('Callback - Redirect URL:', url);
                console.log('Callback - Base URL:', baseUrl);
                if (url.includes('localhost:3000')) {
                    const correctedUrl = url.replace('http://localhost:3000', process.env.NEXTAUTH_URL);
                    console.log('Corrected Redirect URL:', correctedUrl);
                    return correctedUrl;
                }
                if (baseUrl.includes('localhost:3000')) {
                    console.log('Base URL contains localhost:3000, correcting to NEXTAUTH_URL');
                    return process.env.NEXTAUTH_URL;
                }
                return url;
            },
            async session({ session, token, user }) {
                console.log('Session - Base URL:', baseUrl);
                return session;
            },
        },
        pages: {
            signIn: '/auth/signin',
            signOut: '/auth/signout',
            error: '/auth/error',
            verifyRequest: '/auth/verify-request',
            newUser: null,
        },
        baseUrl: baseUrl,
        useSecureCookies: true,
        trustHost: true,
        events: {
            async signIn(message) {
                console.log('SignIn event - Base URL:', baseUrl);
            },
            async signOut(message) {
                console.log('SignOut event - Base URL:', baseUrl);
            },
            async error(message) {
                console.log('Error event - Base URL:', baseUrl);
                console.log('Error details:', message);
            },
        },
    };

    // Перехватываем внутренние вызовы baseUrl в NextAuth
    const originalNextAuth = NextAuth;
    const modifiedNextAuth = (req, res, options) => {
        const modifiedOptions = { ...options };
        // Перехватываем baseUrl
        if (modifiedOptions.baseUrl?.includes('localhost:3000')) {
            console.log('NextAuth baseUrl contains localhost:3000, correcting to NEXTAUTH_URL');
            modifiedOptions.baseUrl = process.env.NEXTAUTH_URL;
        }
        // Перехватываем redirectUri в провайдерах
        modifiedOptions.providers = modifiedOptions.providers.map(provider => {
            if (provider.options?.authorization?.params?.redirect_uri?.includes('localhost:3000')) {
                console.log('Provider redirect_uri contains localhost:3000, correcting to NEXTAUTH_URL');
                provider.options.authorization.params.redirect_uri = provider.options.authorization.params.redirect_uri.replace('http://localhost:3000', process.env.NEXTAUTH_URL);
            }
            return provider;
        });
        // Перехватываем ссылки в конфигурации pages
        if (modifiedOptions.pages) {
            Object.keys(modifiedOptions.pages).forEach(key => {
                if (modifiedOptions.pages[key]?.includes('localhost:3000')) {
                    console.log(`Page ${key} contains localhost:3000, correcting to NEXTAUTH_URL`);
                    modifiedOptions.pages[key] = modifiedOptions.pages[key].replace('http://localhost:3000', process.env.NEXTAUTH_URL);
                }
            });
        }
        // Перехватываем req.url
        if (req.url.includes('localhost:3000')) {
            console.log('Request URL contains localhost:3000, correcting to NEXTAUTH_URL');
            req.url = req.url.replace('http://localhost:3000', process.env.NEXTAUTH_URL);
        }
        return original   return originalNextAuth(req, res, modifiedOptions);
    };

    return modifiedNextAuth(req, res, nextAuthConfig);
}