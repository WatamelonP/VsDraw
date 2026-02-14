from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(
    title="FASTAPI Personal Project",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # allows all origins, basically disables CORS
    allow_credentials=True, # allows cookies to be sent
    allow_methods=["*"], # allows all methods
    allow_headers=["*"], # allows all headers
)

@app.get("/")
def root():
            return { "message": "hamburger" }



@app.get("/users/{username}")
async def read_user(username: str):
    return {"message": f"Hello {username}"}



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)