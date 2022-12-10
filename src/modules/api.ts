import axios from "axios";

export const api = axios.create({
    baseURL: process.env.REST_BASE_URL,    
    headers: {
        Authorization: process.env.REST_AUTHORIZATION,
        Cache: process.env.REST_CACHE
    }
});

export const profiles = {
    create: async (guild_id, user_id) => {
        let profile = null;
        let data = {};        
    
        await api.post(`/profile/${guild_id}/${user_id}`, data)
            .then(({ data }) => {
                profile = data;
                profile.isNew = true;
            });
    
        return profile;
    },

    createTextProfile: async (guild_id, user_id) => {        
        let profile = null;
        let data = {
            text: {
                level: 1,
                experience: 0,
                message_count: 0,
            }
        };        
        await api.patch(`/profile/${guild_id}/${user_id}`, data)
            .then(({ data }) => {                
                profile = data;                
            });
        
        return profile;
    },
    
    show: async (guild_id, user_id) => {
        let profile = null;
        let params = {};
        await api.get(`/profile/${guild_id}/${user_id}`, {params})
        .then(({ data }) => {
            profile = data;
        }).catch(async err => {
            if (err?.response?.status == 404) {            
                profile = await profiles.create(guild_id, user_id);
            } else {
                console.error(err);
            }
        });    
        return profile;
    },
    
    showGuildTree: async (guild_id) => {
        let profileTree = null;
        let params = {};
        await api.get(`/profile/${guild_id}?view=tree`, {params})
        .then(({ data }) => {
            profileTree = data;
        }).catch(async err => {
            console.error(err);
        });    
        return profileTree;
    },

    update: (guild_id, user_id, data) => {           
        api.patch(`/profile/${guild_id}/${user_id}`, data).then(response => {
            // console.log(response.data);
        }).catch(err => console.error(`[update] ${err.message}`));
    },
    
    addExperience: (guild_id, user_id, experience) => {
        let data = {
            "experience": experience,        
        };
        api.patch(`/profile/${guild_id}/${user_id}/add`, data);
    },
    
    add: (guild_id, user_id, data) => {        
        api.patch(`/profile/${guild_id}/${user_id}/add`, data).catch(err => {});
    },
    
    bulkAdd: (data) => {        
        api.patch(`/profile/add`, data).catch(err => {});
    },
    
    levelTop: async (guild_id) => {        
        const top = await api.get(`/profile/${guild_id}/top`, { params: { by: "levels", amount: 0 } });
        return top.data ?? [];
    },
    
    timeTop: async (guild_id) => {
        const top = await api.get(`/profile/${guild_id}/top`, { params: { by: "time", amount: 0 } });
        return top.data ?? [];
    },
    
    pointsTop: async (guild_id) => {        
        const top = await api.get(`/profile/${guild_id}/top`, { params: { by: "points", amount: 0 } });
        return top.data ?? [];
    },

    prayStreakTop: async (guild_id) => {
        const top = await api.get(`/profile/${guild_id}/top`, { params: { by: "pray-streak", amount: 0 } });
        return top.data ?? [];
    },
    
    transaction: (params) => {
        api.post('transaction', params).then(response => {
            // console.log(response.data);
        }).catch(error => {
            console.log(error.response.data);
        });
    },
}