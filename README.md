# Airport Shift Mobile

バイト向けシフト管理モバイルアプリ（Expo + React Native）

## 概要

空港シフト管理システムのモバイルアプリ版です。バイトスタッフが以下の機能を利用できます：

- **ホーム**: 確定シフト一覧の確認
- **リクエスト**: シフト希望の送信
- **募集**: シフト募集への応募

## セットアップ

### 1. リポジトリをクローン

```bash
git clone https://github.com/ikki-dali/airport-shift-mobile.git
cd airport-shift-mobile
```

### 2. 依存関係をインストール

```bash
npm install
```

### 3. 環境変数を設定

`.env.example` をコピーして `.env.local` を作成し、Supabaseの接続情報を設定：

```bash
cp .env.example .env.local
```

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. 開発サーバーを起動

```bash
npx expo start
```

## 技術スタック

- **Expo SDK 52+**
- **React Native**
- **TypeScript**
- **Expo Router** (ファイルベースルーティング)
- **Supabase** (バックエンド)

## ディレクトリ構成

```
airport-shift-mobile/
├── app/                    # Expo Router
│   ├── (tabs)/
│   │   ├── index.tsx      # ホーム（確定シフト一覧）
│   │   ├── request.tsx    # シフト希望送信
│   │   └── recruit.tsx    # 募集一覧
│   └── _layout.tsx
├── src/
│   ├── components/        # UIコンポーネント
│   ├── lib/
│   │   └── supabase.ts   # Supabaseクライアント
│   └── types/            # 型定義
├── .env.example
└── README.md
```

## 開発

### iOS シミュレーターで実行

```bash
npm run ios
```

### Android エミュレーターで実行

```bash
npm run android
```

### Web ブラウザで実行

```bash
npm run web
```

## 関連リポジトリ

- [airport-shift](https://github.com/ikki-dali/airport-shift) - Web管理画面（Next.js）
