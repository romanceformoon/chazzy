import {Nanum_Gothic} from 'next/font/google'

const nanumGothic = Nanum_Gothic({weight: '700', subsets: ['latin']})

export default function RootLayout({children}) {
    return (
        <html lang="ko">
            <body className={nanumGothic.className} style={{ margin: 0 }}>
                {children}
            </body>
        </html>
    )
}
