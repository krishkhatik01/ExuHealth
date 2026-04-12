"""
Configuration for EXUHEALTH Hospital Management System
MySQL Database Settings
"""


class Config:
    MYSQL_HOST = '127.0.0.1'
    MYSQL_PORT = 3306
    MYSQL_USER = 'root'
    MYSQL_PASSWORD = 'admin1234'
    MYSQL_DB = 'exuhealth_db'

    SQLALCHEMY_DATABASE_URI = (
        f'mysql+pymysql://root:admin1234'
        f'@127.0.0.1:3306/exuhealth_db'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = 'exuhealth-secret-key-2024'
