from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random
from typing import List, Dict

app = FastAPI(title="Smart Insurance Hackathon API")

# Настройка CORS, чтобы React (на порту 5173) мог без проблем общаться с FastAPI (на порту 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Модели данных (Pydantic) ---
# То, что бэкенд ожидает получить от фронтенда при броске кубиков
class PlayRequest(BaseModel):
    has_insurance: bool

# То, как выглядит одно событие-карточка
class GameEvent(BaseModel):
    id: int
    title: str
    damage: int
    insurance_type: str
    insurance_cost: int
    theory_base: str

# --- Полная база данных твоих моковых сценариев ---
DATABASE: Dict[str, List[GameEvent]] = {
    "spring": [
        GameEvent(id=1, title="Решил открыть сезон электросамокатов, но не заметил глубокую лужу.", damage=5000, insurance_type="Активный отдых", insurance_cost=500, theory_base="Тут как в игре: страховка — это твой дополнительный хитпоинт (HP) для кошелька."),
        GameEvent(id=2, title="Пошел гулять в новых кроссах, наступил на гвоздь под талым снегом.", damage=3000, insurance_type="Несчастный случай", insurance_cost=300, theory_base="Риск — это вероятность факапа. Страховка этот риск забирает на себя."),
        GameEvent(id=3, title="Весенний паводок в гараже, где стоял твой крутой велик.", damage=4000, insurance_type="Имущество", insurance_cost=400, theory_base="Страховой случай — это когда то, от чего ты страховался, реально произошло."),
        GameEvent(id=4, title="Записался на весенний кэмп по баскетболу, но подвернул ногу на первой тренировке.", damage=6000, insurance_type="Отмена мероприятия", insurance_cost=600, theory_base="Франшиза — это часть денег, которую ты платишь сам, но тут мы обойдемся без нее для простоты."),
        GameEvent(id=5, title="Аллергия на цветение накрыла так, что пришлось пропустить долгожданный концерт.", damage=2500, insurance_type="Здоровье", insurance_cost=250, theory_base="Страховой полис — это твой контракт с боссом уровня 'Страховая компания'.")
    ],
    "summer": [
        GameEvent(id=6, title="Погнали с друзьями прыгать с пирса, телефон выпал из кармана в воду.", damage=15000, insurance_type="Защита гаджетов", insurance_cost=1500, theory_base="Выплата — это те самые деньги, которые тебе возвращают, чтобы ты не грустил над кирпичом."),
        GameEvent(id=7, title="Поехал на фест в другой город, а твой рюкзак уехал в Находку.", damage=7000, insurance_type="Багаж", insurance_cost=700, theory_base="Ассистанс — это служба поддержки, которая разруливает твои проблемы в чужом городе."),
        GameEvent(id=8, title="Соседский пес решил, что твой скейт — это косточка.", damage=5500, insurance_type="Имущество", insurance_cost=550, theory_base="Страховая премия — это цена твоего спокойствия (взнос, который ты платишь в начале)."),
        GameEvent(id=9, title="Солнечный удар после 5 часов игры в пляжку.", damage=2000, insurance_type="ДМС", insurance_cost=200, theory_base="Страховщик — это компания, которая обещает засейвить твои деньги."),
        GameEvent(id=10, title="Взял велик напрокат и случайно поцарапал чужую тачку.", damage=10000, insurance_type="ОСАГО", insurance_cost=1000, theory_base="Ответственность — это когда ты накосячил чужому человеку, и надо платить.")
    ],
    "autumn": [
        GameEvent(id=11, title="В школьной раздевалке кто-то «случайно» сел на твой рюкзак с планшетом.", damage=12000, insurance_type="Порча техники", insurance_cost=1200, theory_base="Лимит ответственности — это максимальная сумма, которую тебе выплатят. Больше не дадут!"),
        GameEvent(id=12, title="Тебя взломали в Telegram и от твоего имени просят денег у мамы.", damage=3000, insurance_type="Киберстрахование", insurance_cost=300, theory_base="Киберриски — это когда воруют не кошелек, а твои данные."),
        GameEvent(id=13, title="Шел под дождем, поскользнулся на листьях, разбил очки/часы.", damage=4500, insurance_type="Личное имущество", insurance_cost=450, theory_base="Страхование — это как зонт: носишь каждый день, пригождается один раз, но спасает капитально."),
        GameEvent(id=14, title="Потерял ключи от квартиры, пришлось вызывать мастера по вскрытию замков.", damage=3500, insurance_type="Помощь на дому", insurance_cost=350, theory_base="Срок действия полиса — время, пока ты под защитой. Не профукай дату!"),
        GameEvent(id=15, title="Твой проект по информатике «умер» вместе с флешкой из-за скачка напряжения.", damage=2000, insurance_type="Защита данных", insurance_cost=200, theory_base="Объект страхования — это то, что мы защищаем (твоя флешка или инфа).")
    ],
    "winter": [
        GameEvent(id=16, title="Сделал неудачное сальто в сугроб, а там оказался бордюр.", damage=8000, insurance_type="Спортивная страховка", insurance_cost=800, theory_base="Риск-менеджмент — это когда ты заранее купил страховку, зная, что ты экстремал."),
        GameEvent(id=17, title="Оставил телефон на морозе -30°C, и у него «умер» аккумулятор.", damage=4000, insurance_type="Поломка электроники", insurance_cost=400, theory_base="Исключения из страховки — это ситуации, за которые не платят (например, если ты специально бил телефон)."),
        GameEvent(id=18, title="Петарда от задорных соседей прилетела прямо в твое окно.", damage=6000, insurance_type="Имущество", insurance_cost=600, theory_base="Третьи лица — это любые люди, кроме тебя и страховой."),
        GameEvent(id=19, title="Летел в горы, но из-за метели рейс отменили, отель не вернул деньги.", damage=10000, insurance_type="Срыв поездки", insurance_cost=1000, theory_base="Форс-мажор — это обстоятельства непреодолимой силы (как эта метель)."),
        GameEvent(id=20, title="На катке кто-то наехал коньком на твою куртку.", damage=5000, insurance_type="Личные вещи", insurance_cost=500, theory_base="Амортизация — это когда вещь со временем дешевеет. Страховая учитывает это при выплате.")
    ]
}

# --- Эндпоинты API ---

@app.get("/api/events/{season}", response_model=List[GameEvent])
async def get_season_events(season: str):
    """Возвращает перемешанный список событий для выбранного сезона"""
    events = DATABASE.get(season.lower(), [])
    # Делаем копию и перемешиваем, чтобы при каждом прохождении карточки выпадали в разном порядке
    random_events = events.copy()
    random.shuffle(random_events)
    return random_events

@app.post("/api/play")
async def play_event(request: PlayRequest):
    """Рассчитывает вероятность наступления страхового случая"""
    # Шанс факапа 60%. Если сделать 50/50 будет скучно, а 60% заставит пользователя
    # почувствовать, что страховка реально была нужна.
    occured = random.random() < 0.60
    return {"occured": occured}

if __name__ == "__main__":
    import uvicorn
    # Запуск сервера на порту 8000
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)