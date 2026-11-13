// 服务前缀 admin or tenantadmin
// 生产环境需要添加 /YnMoa 前缀
const baseContext = '/ynzqgztmoa/gov/admin'
const envPrefix = import.meta.env.VITE_API_PREFIX || ''
export const API_CONTEXT = `${envPrefix}${baseContext}`
