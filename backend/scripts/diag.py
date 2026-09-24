import httpx, os
from dotenv import load_dotenv
load_dotenv()
key = os.environ['YANDEX_RASP_API_KEY']

r = httpx.get('https://api.rasp.yandex.net/v3.0/stations_list/',
              params={'apikey': key, 'format': 'json', 'lang': 'ru_RU'},
              timeout=180)
print('STATUS:', r.status_code)
data = r.json()

print('TOP-LEVEL KEYS:', list(data.keys()))
countries = data.get('countries', [])
print('Всего стран:', len(countries))

for c in countries[:5]:
    print('  Страна:', c.get('title'))

# Найдём Россию
ru = next((c for c in countries if 'Росси' in c.get('title','')), None)
if not ru:
    print('!!! Россия не найдена. Проверяем все страны:')
    for c in countries:
        print('  ', c.get('title'))
    raise SystemExit

regions = ru.get('regions', [])
print('Регионов в России:', len(regions))

for reg in regions[:10]:
    print('  Регион:', reg.get('title'))

# Найдём Москву
msk = next((r for r in regions if 'Москв' in r.get('title','')), None)
if not msk:
    print('!!! Москва не найдена')
    raise SystemExit

print('Москва найдена, settlements:', len(msk.get('settlements', [])))

# Считаем станции во всех settlements
total = 0
sample = []
for sett in msk.get('settlements', []):
    for st in sett.get('stations', []):
        total += 1
        if len(sample) < 20:
            t = st.get('title', '?')
            tt = st.get('transport_type', '?')
            code = (st.get('codes') or {}).get('yandex_code', '?')
            sample.append(f'  {t!r:40} type={tt:12} code={code}')

print('Всего станций в Москве:', total)
print('Первые 20:')
for s in sample:
    print(s)
