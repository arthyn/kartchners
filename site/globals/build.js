// Exposes build metadata to templates. Netlify sets COMMIT_REF during builds.
module.exports = {
  commit: process.env.COMMIT_REF || 'local',
  time: new Date().toISOString(),
}
