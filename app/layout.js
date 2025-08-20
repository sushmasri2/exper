import '../styles/global.css'

export const metadata = {
    title: 'Content Management System',
    description: 'Content Management System for managing content efficiently',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </head>
            <body>
                {children}
            </body>
        </html>
    )
}