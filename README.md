# 🔮 Ezostylia — Daily Tarot Bot for Twitter/X

Automatyczny bot postujący codziennie jedną kartę tarota na Twitterze/X.
Posty w języku polskim z poetycką interpretacją i linkiem do ezostylia.com.

## Funkcje

- 78 kart tarota (Wielkie i Małe Arkana) z polskimi interpretacjami
- Codzienne losowanie karty o 9:00 rano (strefa Warsaw)
- Brak powtórek — bot nie wylosuje tej samej karty dwa dni z rzędu
- Każdy tweet mieści się w limicie 280 znaków
- Hashtagi: #TarotPolski #KartaDnia #Ezostylia #Tarot #Runy

## Wymagania

- Node.js >= 18
- Konto Twitter Developer z Free API tier
- Klucze API (App Key, App Secret, Access Token, Access Secret)

## Konfiguracja

1. Skopiuj `.env.example` do `.env` i uzupełnij dane:

```bash
cp .env.example .env
```

2. Ustaw klucze API w pliku `.env`:

```
TWITTER_APP_KEY=twój_klucz
TWITTER_APP_SECRET=twój_sekret
TWITTER_ACCESS_TOKEN=twój_token
TWITTER_ACCESS_SECRET=twój_token_secret
```

3. Zainstaluj zależności:

```bash
npm install
```

4. Uruchom bota:

```bash
npm start
```

## Deploy na Render

### Background Worker (zalecane dla bota)

1. Utwórz konto na [render.com](https://render.com)
2. New → Background Worker → połącz z repozytorium GitHub
3. Ustawienia:
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node bot.js`
   - **Instance Type:** Free
4. Dodaj Environment Variables:
   - `TWITTER_APP_KEY`
   - `TWITTER_APP_SECRET`
   - `TWITTER_ACCESS_TOKEN`
   - `TWITTER_ACCESS_SECRET`
5. Deploy!

## Opcjonalna konfiguracja

| Zmienna | Domyślna | Opis |
|---------|----------|------|
| `CRON_SCHEDULE` | `0 9 * * *` | Harmonogram cron |
| `TIMEZONE` | `Europe/Warsaw` | Strefa czasowa |

## Testowanie

```bash
npm test
```
