import datetime
import jwt
from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from passlib.context import CryptContext

# class for handling auth process
class AuthHandler:
    # uses HTTPBearer as the security dependency
    security = HTTPBearer()
    # defines a password-processing context from passlib
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    secret = "SecretString"

    # function creates hash of a given password
    def get_password_hash(self, password: str) -> str:
        return self.pwd_context.hash(password)
    
    # verifies that the hash of plain pass in equal to hashed pass
    def verify_password(
            self,
            plain_password: str,
            hashed_password: str) -> bool:
        return self.pwd_context.verify(
            plain_password, hashed_password
        )
    
    # creating an encoded jwt token
    def encode_token(self, user_id: int, username: str) -> str:
        payload = {
            # expiration time
            "exp": datetime.datetime.now(datetime.timezone.utc)
            + datetime.timedelta(minutes=30),
            # issued at time
            "iat": datetime.datetime.now(datetime.timezone.utc),
            # data to encode (can add role adm/usr (won't have roles in the app))
            "sub": {"user_id": user_id, "username": username},
        }
        return jwt.encode(payload, self.secret, algorithm="HS256")
    
    # decoding the token
    def decode_token(self, token: str):
        try:
            # token to decode using secret and algorithm used to encode
            payload = jwt.decode(
                token,
                self.secret,
                algorithms=["HS256"])
            # return only encoded data in sub section
            return payload["sub"]
        # give error if token is expired
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=401,
                detail="Signature has expired")
        # give error if token is invalid
        except jwt.InvalidTokenError:
            raise HTTPException(
                status_code=401,
                detail="Invalid token")
        
    # dependency that checks for the presence of a valid JWT
    # passed as a bearer token in the request headers
    # basicly checks if user is logged in
    def auth_wrapper(
            self,
            auth: HTTPAuthorizationCredentials = Security(security)) -> dict:
        return self.decode_token(auth.credentials)
