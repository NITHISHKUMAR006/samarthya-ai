// vite.config.ts
import { defineConfig, loadEnv } from "file:///C:/Users/nanthakps/Desktop/nithish/samarthya-ai/frontend/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/nanthakps/Desktop/nithish/samarthya-ai/frontend/node_modules/@vitejs/plugin-react/dist/index.js";
import fs from "fs";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const extraHosts = (env.ALLOWED_HOSTS || env.VITE_ALLOWED_HOSTS || "").split(",").map((h) => h.trim()).filter(Boolean);
  const isDocker = fs.existsSync("/.dockerenv") || fs.existsSync("/run/.containerenv") || Boolean(process.env.DOCKER_CONTAINER);
  const defaultBackend = isDocker ? "http://backend:5173" : "http://localhost:5173";
  const backendTarget = process.env.BACKEND_URL || env.BACKEND_URL || defaultBackend;
  return {
    plugins: [react()],
    server: {
      port: 8005,
      host: true,
      allowedHosts: Array.from(
        /* @__PURE__ */ new Set([
          "localhost",
          "127.0.0.1",
          ...extraHosts
        ])
      ),
      proxy: {
        "/api": {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on("error", (err, _req, res) => {
              console.warn(`[vite proxy error to ${backendTarget}]:`, err.message);
              if (res && !res.headersSent && typeof res.writeHead === "function") {
                res.writeHead(502, { "Content-Type": "application/json" });
                res.end(
                  JSON.stringify({
                    detail: "Backend server is starting up or unreachable. Please retry in a few seconds."
                  })
                );
              }
            });
          }
        }
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxuYW50aGFrcHNcXFxcRGVza3RvcFxcXFxuaXRoaXNoXFxcXHNhbWFydGh5YS1haVxcXFxmcm9udGVuZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbmFudGhha3BzXFxcXERlc2t0b3BcXFxcbml0aGlzaFxcXFxzYW1hcnRoeWEtYWlcXFxcZnJvbnRlbmRcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL25hbnRoYWtwcy9EZXNrdG9wL25pdGhpc2gvc2FtYXJ0aHlhLWFpL2Zyb250ZW5kL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xyXG5pbXBvcnQgZnMgZnJvbSAnZnMnXHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiB7XHJcbiAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCBwcm9jZXNzLmN3ZCgpLCAnJylcclxuICBjb25zdCBleHRyYUhvc3RzID0gKGVudi5BTExPV0VEX0hPU1RTIHx8IGVudi5WSVRFX0FMTE9XRURfSE9TVFMgfHwgJycpXHJcbiAgICAuc3BsaXQoJywnKVxyXG4gICAgLm1hcCgoaCkgPT4gaC50cmltKCkpXHJcbiAgICAuZmlsdGVyKEJvb2xlYW4pXHJcblxyXG4gIC8vIEF1dG8tZGV0ZWN0IGNvbnRhaW5lciB2cyBob3N0OlxyXG4gIC8vIEluc2lkZSBEb2NrZXIgY29udGFpbmVyLCBiYWNrZW5kIGlzIHJlYWNoYWJsZSBhdCAnaHR0cDovL2JhY2tlbmQ6NTE3MydcclxuICAvLyBPdXRzaWRlIERvY2tlciAobG9jYWwgbWFjaGluZSksIGJhY2tlbmQgaXMgcmVhY2hhYmxlIGF0ICdodHRwOi8vbG9jYWxob3N0OjUxNzMnXHJcbiAgY29uc3QgaXNEb2NrZXIgPVxyXG4gICAgZnMuZXhpc3RzU3luYygnLy5kb2NrZXJlbnYnKSB8fFxyXG4gICAgZnMuZXhpc3RzU3luYygnL3J1bi8uY29udGFpbmVyZW52JykgfHxcclxuICAgIEJvb2xlYW4ocHJvY2Vzcy5lbnYuRE9DS0VSX0NPTlRBSU5FUilcclxuXHJcbiAgY29uc3QgZGVmYXVsdEJhY2tlbmQgPSBpc0RvY2tlciA/ICdodHRwOi8vYmFja2VuZDo1MTczJyA6ICdodHRwOi8vbG9jYWxob3N0OjUxNzMnXHJcbiAgY29uc3QgYmFja2VuZFRhcmdldCA9IHByb2Nlc3MuZW52LkJBQ0tFTkRfVVJMIHx8IGVudi5CQUNLRU5EX1VSTCB8fCBkZWZhdWx0QmFja2VuZFxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgcGx1Z2luczogW3JlYWN0KCldLFxyXG4gICAgc2VydmVyOiB7XHJcbiAgICAgIHBvcnQ6IDgwMDUsXHJcbiAgICAgIGhvc3Q6IHRydWUsXHJcbiAgICAgIGFsbG93ZWRIb3N0czogQXJyYXkuZnJvbShcclxuICAgICAgICBuZXcgU2V0KFtcclxuICAgICAgICAgICdsb2NhbGhvc3QnLFxyXG4gICAgICAgICAgJzEyNy4wLjAuMScsXHJcbiAgICAgICAgICAuLi5leHRyYUhvc3RzLFxyXG4gICAgICAgIF0pXHJcbiAgICAgICksXHJcbiAgICAgIHByb3h5OiB7XHJcbiAgICAgICAgJy9hcGknOiB7XHJcbiAgICAgICAgICB0YXJnZXQ6IGJhY2tlbmRUYXJnZXQsXHJcbiAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgICBzZWN1cmU6IGZhbHNlLFxyXG4gICAgICAgICAgY29uZmlndXJlOiAocHJveHkpID0+IHtcclxuICAgICAgICAgICAgcHJveHkub24oJ2Vycm9yJywgKGVyciwgX3JlcSwgcmVzOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFt2aXRlIHByb3h5IGVycm9yIHRvICR7YmFja2VuZFRhcmdldH1dOmAsIGVyci5tZXNzYWdlKVxyXG4gICAgICAgICAgICAgIGlmIChyZXMgJiYgIXJlcy5oZWFkZXJzU2VudCAmJiB0eXBlb2YgcmVzLndyaXRlSGVhZCA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAgICAgcmVzLndyaXRlSGVhZCg1MDIsIHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9KVxyXG4gICAgICAgICAgICAgICAgcmVzLmVuZChcclxuICAgICAgICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkoe1xyXG4gICAgICAgICAgICAgICAgICAgIGRldGFpbDpcclxuICAgICAgICAgICAgICAgICAgICAgICdCYWNrZW5kIHNlcnZlciBpcyBzdGFydGluZyB1cCBvciB1bnJlYWNoYWJsZS4gUGxlYXNlIHJldHJ5IGluIGEgZmV3IHNlY29uZHMuJyxcclxuICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIH1cclxufSlcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF3VyxTQUFTLGNBQWMsZUFBZTtBQUM5WSxPQUFPLFdBQVc7QUFDbEIsT0FBTyxRQUFRO0FBR2YsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE1BQU07QUFDeEMsUUFBTSxNQUFNLFFBQVEsTUFBTSxRQUFRLElBQUksR0FBRyxFQUFFO0FBQzNDLFFBQU0sY0FBYyxJQUFJLGlCQUFpQixJQUFJLHNCQUFzQixJQUNoRSxNQUFNLEdBQUcsRUFDVCxJQUFJLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxFQUNuQixPQUFPLE9BQU87QUFLakIsUUFBTSxXQUNKLEdBQUcsV0FBVyxhQUFhLEtBQzNCLEdBQUcsV0FBVyxvQkFBb0IsS0FDbEMsUUFBUSxRQUFRLElBQUksZ0JBQWdCO0FBRXRDLFFBQU0saUJBQWlCLFdBQVcsd0JBQXdCO0FBQzFELFFBQU0sZ0JBQWdCLFFBQVEsSUFBSSxlQUFlLElBQUksZUFBZTtBQUVwRSxTQUFPO0FBQUEsSUFDTCxTQUFTLENBQUMsTUFBTSxDQUFDO0FBQUEsSUFDakIsUUFBUTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sY0FBYyxNQUFNO0FBQUEsUUFDbEIsb0JBQUksSUFBSTtBQUFBLFVBQ047QUFBQSxVQUNBO0FBQUEsVUFDQSxHQUFHO0FBQUEsUUFDTCxDQUFDO0FBQUEsTUFDSDtBQUFBLE1BQ0EsT0FBTztBQUFBLFFBQ0wsUUFBUTtBQUFBLFVBQ04sUUFBUTtBQUFBLFVBQ1IsY0FBYztBQUFBLFVBQ2QsUUFBUTtBQUFBLFVBQ1IsV0FBVyxDQUFDLFVBQVU7QUFDcEIsa0JBQU0sR0FBRyxTQUFTLENBQUMsS0FBSyxNQUFNLFFBQWE7QUFDekMsc0JBQVEsS0FBSyx3QkFBd0IsYUFBYSxNQUFNLElBQUksT0FBTztBQUNuRSxrQkFBSSxPQUFPLENBQUMsSUFBSSxlQUFlLE9BQU8sSUFBSSxjQUFjLFlBQVk7QUFDbEUsb0JBQUksVUFBVSxLQUFLLEVBQUUsZ0JBQWdCLG1CQUFtQixDQUFDO0FBQ3pELG9CQUFJO0FBQUEsa0JBQ0YsS0FBSyxVQUFVO0FBQUEsb0JBQ2IsUUFDRTtBQUFBLGtCQUNKLENBQUM7QUFBQSxnQkFDSDtBQUFBLGNBQ0Y7QUFBQSxZQUNGLENBQUM7QUFBQSxVQUNIO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
