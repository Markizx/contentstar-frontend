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
    console.log('Base URL:', baseUrl);
    console.log('Request Headers:', req.headers);
    console.log('Host Header:', req.headers.host);
    console.log('Protocol:', req.headers['x-forwarded-proto'] || 'http');
    console.log('Full URL:', `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}`);

    // Проверяем куки и очищаем next-auth.callback-url, если он содержит localhost:3000
    const cookies = req.headers.cookie || '';
    if (cookies.includes('next-auth.callback-url') && cookies.includes('localhost:3000')) {
        console.log('Found invalid callback-url in cookies, clearing...');
        res.setHeader('Set-Cookie', [
            'next-auth.callback-url=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; HttpOnly',
            '__Secure-next-auth.callback-url=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; HttpOnly',
        ]);
    }

    // Перехватываем редиректы
    const originalRedirect = res.redirect;
    res.redirect = (status, url) => {
        console.log('Redirect attempt:', status, url);
        // Если редирект идёт на localhost:3000, заменяем на NEXTAUTH_URL
        if (url.includes('localhost:3000')) {
            const newUrl = url.replace('http://localhost:3000', process.env.NEXTAUTH_URL);
            console.log('Redirect corrected to:', newUrl);
            return originalRedirect.call(res, status, newUrl);
        }
        return originalRedirect.call(res, status, url);
    };

    return NextAuth(req, res, {
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
                console.log('Redirect URL:', url);
                console.log('Base URL:', baseUrl);
                // Всегда используем NEXTAUTH_URL
                return process.env.NEXTAUTH_URL;
            },
            async session({ session, token, user }) {
                console.log('Session Base URL:', baseUrl);
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
        // Явно задаём baseUrl для всех операций
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
    });
}