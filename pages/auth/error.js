import { useRouter } from 'next/router';

export default function AuthError() {
    const router = useRouter();
    const { error } = router.query;

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>Authentication Error</h1>
            <p>An error occurred during authentication: {error || 'Unknown error'}</p>
            <button onClick={() => router.push('/')}>Go to Home</button>
        </div>
    );
}