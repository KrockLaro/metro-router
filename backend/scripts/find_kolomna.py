import httpx, os
from dotenv import load_dotenv
load_dotenv()
key = os.environ['YANDEX_RASP_API_KEY']

r = httpx.get('https://api.rasp.yandex.net/v3.0/stations_list/',
              params={'apikey': key, 'format': 'json', 'lang': 'ru_RU'},
              timeout=180)
data = r.json()

needle = 'коломенск'  # 'коломенск'

for c in data['countries']:
    if c.get('title') != 'Россия':
        continue
    for reg in c['regions']:
        if 'Москв' not in reg.get('title', ''):
            continue
        for sett in reg['settlements']:
            for st in sett.get('stations', []):
                title = st.get('title', '')
                if needle in title.lower():
                    code = (st.get('codes') or {}).get('yandex_code', '?')
                    tt = st.get('transport_type', '?')
                    print(f'{title:50} type={tt:10} code={code}')
