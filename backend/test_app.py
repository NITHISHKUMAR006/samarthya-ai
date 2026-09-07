"""Quick test to verify the FastAPI app loads correctly."""
import sys
sys.path.insert(0, ".")

try:
    from app.main import app
    print("FastAPI app loaded OK")
    print(f"Routes: {len(app.routes)}")
    for route in app.routes:
        if hasattr(route, 'path') and hasattr(route, 'methods'):
            print(f"  {route.methods} {route.path}")
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
