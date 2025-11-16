import logging
from app.db.session import SessionLocal as Session
from app.repository.otp.otp_interface import OTPInterface
from app.models.otp import OTP

class OTPImplement(OTPInterface):
    def create_otp(self, otp: OTP) -> bool:
        session = Session()
        try:
            session.query(OTP).filter(OTP.email == otp.email).delete()
            
            session.add(otp)
            session.commit()
            return True
        except Exception as e:
            session.rollback()
            logging.error(f"Error creating OTP: {e}")
            return False
        finally:
            session.close()
    
    def get_otp_by_email_and_code(self, email: str, otp_code: str) -> OTP:
        session = Session()
        try:
            otp = (
                session.query(OTP)
                .filter(OTP.email == email, OTP.otp == otp_code)
                .first()
            )
            return otp
        except Exception as e:
            logging.error(f"Error getting OTP: {e}")
            return None
        finally:
            session.close()
    
    def delete_otp_by_email(self, email: str) -> bool:
        session = Session()
        try:
            session.query(OTP).filter(OTP.email == email).delete()
            session.commit()
            return True
        except Exception as e:
            session.rollback()
            logging.error(f"Error deleting OTP: {e}")
            return False
        finally:
            session.close()
