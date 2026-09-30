# Gen ảnh cho Green Journey

```bash
node tools/gen-images/server.mjs   # Node 18+, không cần cài gì
# mở http://localhost:5174, dán OpenAI API key, bấm Gen
```

- Ảnh lưu vào `assets/` (đổi model bằng `IMAGE_MODEL`, mặc định `gpt-image-1`).
- Key chỉ gửi tới server local, không ghi ra đĩa. Cũng có thể đặt `OPENAI_API_KEY` thay vì dán.
- Có thể cần Organization Verification bên OpenAI để dùng `gpt-image-1`.
