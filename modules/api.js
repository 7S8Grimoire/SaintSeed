const { default: axios } = require('axios');
api = axios.create({
    baseURL: process.env.REST_BASE_URL,    
    headers: {
        Authorization: process.env.REST_AUTHORIZATION,
        Cache: process.env.REST_CACHE
    }
});

profiles = {
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
                error(err);
                // console.error(err);
            }
        });    
        return profile;
    },
    
    update: (guild_id, user_id, data) => {        
        console.log("data", data);
        api.patch(`/profile/${guild_id}/${user_id}`, data).then(response => {
            // console.log(response.data);
        }).catch(err => console.error(err.message));
    },
    
    addExperience: (guild_id, user_id, experience) => {
        let data = {
            "experience": experience,        
        };
        api.patch(`/profile/${guild_id}/${user_id}/add`, data);
    },
    
    add: (guild_id, user_id, data) => {        
        api.patch(`/profile/${guild_id}/${user_id}/add`, data);
    },
    
    levelTop: async (guild_id) => {
        let top = [];
        top = await api.get(`/profile/${guild_id}/level-top`);
        return top.data ?? [];
    },
    
    timeTop: async (guild_id) => {
        let top = [];
        top = await api.get(`/profile/${guild_id}/time-top`);
        return top.data ?? [];
    },
    
    pointsTop: async (guild_id) => {
        let top = [];
        top = await api.get(`/profile/${guild_id}/points-top`);
        return top.data ?? [];
    },
    
    transaction: (params) => {
        api.post('transaction', params).then(response => {
            // console.log(response.data);
        }).catch(error => {
            error(err);
            // console.log(error.response);
        });
    },
}

exports.api = api;
exports.profiles = profiles;