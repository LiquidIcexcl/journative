import { getCurrentUser } from "@/lib/appwrite"
import { User } from "@/lib/modal"
import { createContext, useContext, useEffect, useState } from "react"

type GlobalContextType = {
    user: User
    setUser: (user:User) => void
    refreshUser: () => void
    refreshPosts: () => void,
    freshPostCnt: number
}

const GlobalContext = createContext<GlobalContextType>({
    user: {
        userId: '',
        name: "",
        email: "",
        avatarUrl: ""
    },
    setUser: () => {},
    refreshUser: () => {},
    refreshPosts: () => {},
    freshPostCnt: 0
})

export const useGlobalContext = () => {
    return useContext(GlobalContext)
}

export const GlobalContextProvider = ({children}: {children: React.ReactNode}) => {
    const [user, setUser] = useState<User>({
        userId: '',
        name: "",
        email: "",
        avatarUrl: ""
    })

    const [refreshCnt, setRefreshUserCnt] = useState(0)
    const [refreshPostsCnt, setRefreshPostsCnt] = useState(0)

    const getUserInfo = async () => {
        try {
            const user = await getCurrentUser()
            if (user) {
                setUser(user)
            }
        } catch (error) {
            console.log(error)
            setUser({
                userId: '',
                name: "",
                email: "",
                avatarUrl: ""
            })
        }
    }

    useEffect(() => {
        getUserInfo()
    }, [refreshCnt])

    return (
        <GlobalContext.Provider
            value={
                {
                    user, 
                    setUser,
                    refreshUser: () => {
                        setRefreshUserCnt(prev => prev + 1)
                    },
                    refreshPosts: () => {
                        setRefreshPostsCnt(prev => prev + 1)
                    },
                    freshPostCnt: refreshPostsCnt
                }
            }   
        >
            {children}
        </GlobalContext.Provider>
    )
}