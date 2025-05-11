import FollowPage from "@/app/(home)/followPage";
import FoundPage from "@/app/(home)/foundPage";
import ProfilePage from "@/app/(home)/profilePage";

export const PAGE_INFO={
    FoundPage:{
        title:"发现",
        icon:"found",
        component:FoundPage,
        headerShown:false,
        options:{
            headerShown:false,
        }
    },
    MessagePage:{},
    FollowPage:{
        title:"关注",
        icon:"follow",
        component:FollowPage,
        headerShown:false,
        options:{
            headerShown:false,
        }
    },
    ProfilePage:{
        title:"个人",
        icon:"profile",
        component:ProfilePage,
        headerShown:false,
        options:{
            headerShown:false,
        }
    },
    MinePage:{},
    MarkPage:{},
    LikePage:{},
    
}