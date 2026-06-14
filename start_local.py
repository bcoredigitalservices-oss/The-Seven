import subprocess
import os
import sys
import time

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(root_dir, "backend")
    frontend_dir = os.path.join(root_dir, "frontend")

    print("==================================================")
    print("  INITIALIZING SEVEN WORKSPACE LOCAL ECOSYSTEM")
    print("==================================================\n")

    # Start Backend
    print("[SYSTEM] Booting Python FastAPI Backend (Port 8080)...")
    backend_env = os.environ.copy()
    if "DATABASE_URL" not in backend_env:
        backend_env["DATABASE_URL"] = "postgresql://traveluser:travelpassword@localhost:5433/seven"
    
    is_windows = os.name == 'nt'
    uvicorn_path = r"venv\Scripts\uvicorn" if is_windows else "venv/bin/uvicorn"
    npm_cmd = "npm.cmd" if is_windows else "npm"

    # We use shell=True and point to the local venv uvicorn
    backend_process = subprocess.Popen(
        [uvicorn_path, "app.main:app", "--port", "8080", "--reload"],
        cwd=backend_dir,
        env=backend_env,
        shell=is_windows # only use shell=True on windows if possible, or just True for both
    )

    # Give backend a moment to start
    time.sleep(2)

    # Kill any stale process on port 3050 before starting frontend
    print("[SYSTEM] Clearing port 3050 of any stale processes...")
    import subprocess as _sp
    _sp.run(["fuser", "-k", "3050/tcp"], capture_output=True)

    # Start Frontend
    print("[SYSTEM] Booting Next.js Frontend (Port 3050)...")
    frontend_env = os.environ.copy()
    frontend_env["PORT"] = "3050"
    frontend_process = subprocess.Popen(
        [npm_cmd, "run", "dev", "--", "-p", "3050"],
        cwd=frontend_dir,
        env=frontend_env,
        shell=is_windows
    )

    print("\n==================================================")
    print("  ALL SYSTEMS ONLINE")
    print("  Frontend Interface: http://localhost:3050")
    print("  Backend API:        http://localhost:8080")
    print("  Press Ctrl+C to safely terminate the workspace.")
    print("==================================================\n")

    try:
        # Keep main thread alive while subprocesses run
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n[SYSTEM] Termination signal received. Shutting down ecosystem...")
        backend_process.terminate()
        frontend_process.terminate()
        backend_process.wait()
        frontend_process.wait()
        print("[SYSTEM] Local ecosystem terminated cleanly. Goodbye.")

if __name__ == "__main__":
    main()
