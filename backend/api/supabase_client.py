# backend/api/supabase_client.py
import os
from dotenv import load_dotenv
from supabase import create_client

# ===============================
# .env を読み込む
# プロジェクトルート（FashionCoordinate/.env）を指定
# ===============================
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # backend/settings.py 相対
dotenv_path = os.path.join(BASE_DIR,'.env')
load_dotenv(dotenv_path)

# ===============================
# Supabase 接続情報
# ===============================
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")  # .env に合わせる

# ===============================
# Supabase クライアント生成
# ===============================
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)