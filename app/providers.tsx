// In Next.js, this file would be called: app/providers.tsx
'use client'

// Since QueryClientProvider relies on useContext under the hood, we have to put 'use client' on top
import {
    isServer,
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query'
import { forwardRef, ReactNode } from 'react'
import { CustomContentProps, SnackbarContent, SnackbarProvider } from 'notistack';
import { Slide } from '@mui/material';

function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                // With SSR, we usually want to set some default staleTime
                // above 0 to avoid refetching immediately on the client
                staleTime: 60 * 1000,
            },
        },
    })
}

let browserQueryClient: QueryClient | undefined = undefined

export function getQueryClient() {
    if (isServer) {
        // Server: always make a new query client
        return makeQueryClient()
    } else {
        // Browser: make a new query client if we don't already have one
        // This is very important, so we don't re-make a new client if React
        // suspends during the initial render. This may not be needed if we
        // have a suspense boundary BELOW the creation of the query client
        if (!browserQueryClient) browserQueryClient = makeQueryClient()
        return browserQueryClient
    }
}

function SlideTransitionRight(props: any) {
    return <Slide {...props} direction="left" />; // Right to Left Animation
}


const CustomSnackbar = forwardRef<HTMLDivElement, CustomContentProps>(
    ({ id, message, variant }, ref) => {
        return (
            <SnackbarContent
                ref={ref}
                className={`shadow-md rounded-lg p-3 text-gray-700 ${ variant === 'success' ? 'bg-green-300' :
                    variant === 'warning' ? 'bg-yellow-300' :
                        variant === 'error' ? 'bg-red-300' :
                            'bg-[#daebff]'
                    }`}
            >
                <span className="flex items-center space-x-2">
                    {variant === 'success' && <span className='text-xl'>✔️</span>}
                    {variant === 'warning' && <span className='text-xl'>⚠️</span>}
                    {variant === 'error' && <span className='text-xl'>❌</span>}
                    {variant === 'info' && <span className='text-xl'>ℹ️</span>}
                    <span className='capitalize font-semibold'>{message}</span>
                </span>
            </SnackbarContent>
        );
    });

export default function Providers({ children }: { children: ReactNode }) {
    // Get or create the query client
    const queryClient = getQueryClient();
    return (
        <QueryClientProvider client={queryClient}>
            <SnackbarProvider
                preventDuplicate
                iconVariant={{
                    success: <span className="mr-2">✔️</span>,  // Adds margin between icon & text
                    warning: <span className="mr-2">⚠️</span>,
                    error: <span className="mr-2">❌</span>,
                    info: <span className="mr-2">ℹ️</span>,
                }}
                Components={{
                    success: (props) => <CustomSnackbar {...props} />,
                    warning: (props) => <CustomSnackbar {...props} />,
                    error: (props) => <CustomSnackbar {...props} />,
                    info: (props) => <CustomSnackbar {...props} />,
                }}
                maxSnack={3}
                autoHideDuration={2000}
                TransitionComponent={SlideTransitionRight}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                {children}
            </SnackbarProvider>
        </QueryClientProvider>
    )

}