from fastapi import FastAPI


app = FastAPI()


@app.get("/")
def root():
            return { "message": "hamburger" }



@app.get("/users/{username}")
async def read_user(username: str):
    return {"message": f"Hello {username}"}