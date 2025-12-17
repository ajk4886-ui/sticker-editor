const canvas = document.getElementById('editor');
    const ctx = canvas.getContext('2d');
    canvas.width = 600;
    canvas.height = 400;

    let images = {};
    let currentKey = null;
    let dragging = false;
    let lastX, lastY;

    function draw() {
     const bgColor = window.getComputedStyle(uploadBox).backgroundColor || '#fff';
ctx.fillStyle = bgColor;
ctx.fillRect(0,0,canvas.width,canvas.height);

      Object.entries(images).forEach(([key, obj]) => {
        ctx.save();
        ctx.translate(obj.x, obj.y);
        ctx.rotate(obj.rotation);
        ctx.scale(obj.scale, obj.scale);
        ctx.drawImage(obj.img, -obj.img.width / 2, -obj.img.height / 2);

        // 선택된 이미지 테두리 표시
        if (key === currentKey) {
          ctx.strokeStyle = "red";
          ctx.lineWidth = 2;
          ctx.strokeRect(
            -obj.img.width / 2,
            -obj.img.height / 2,
            obj.img.width,
            obj.img.height
          );
        }
        ctx.restore();
      });
    }

    // 이미지 썸네일 클릭 → 이미지 추가 또는 선택
    document.querySelectorAll('.thumbs img').forEach(th => {
      th.addEventListener('click', () => {
        const key = th.dataset.img;
        currentKey = key;

        if (!images[key]) {
          const newImg = new Image();
          newImg.src = key;
          newImg.onload = () => {
            images[key] = {
              img: newImg,
              x: 300,
              y: 200,
              scale: 1,
              rotation: 0
            };
            draw();
          };
        } else {
          draw();
        }
      });
    });

    // 캔버스 클릭 → 어떤 이미지 클릭했는지 판별하여 선택
    canvas.addEventListener('mousedown', e => {
      const x = e.offsetX;
      const y = e.offsetY;
      let selected = null;

      // 뒤에 있는 것부터 선택되도록 역순으로 검사 (레이어처럼)
      const entries = Object.entries(images).reverse();

      for (const [key, obj] of entries) {
        const dx = x - obj.x;
        const dy = y - obj.y;

        const cos = Math.cos(-obj.rotation);
        const sin = Math.sin(-obj.rotation);

        const rx = (dx * cos - dy * sin) / obj.scale;
        const ry = (dx * sin + dy * cos) / obj.scale;

        if (
          rx > -obj.img.width / 2 &&
          rx < obj.img.width / 2 &&
          ry > -obj.img.height / 2 &&
          ry < obj.img.height / 2
        ) {
          selected = key;
          break;
        }
      }

      if (selected) {
        currentKey = selected;
        dragging = true;
        lastX = x;
        lastY = y;
        draw();
      }
    });

    canvas.addEventListener('mousemove', e => {
      if (!dragging || !currentKey) return;

      const dx = e.offsetX - lastX;
      const dy = e.offsetY - lastY;

      images[currentKey].x += dx;
      images[currentKey].y += dy;

      lastX = e.offsetX;
      lastY = e.offsetY;

      draw();
    });

    canvas.addEventListener('mouseup', () => dragging = false);
    canvas.addEventListener('mouseleave', () => dragging = false);

    // 스케일(마우스 휠)
    canvas.addEventListener('wheel', e => {
      if (!currentKey) return;
      e.preventDefault();

      const obj = images[currentKey];
      obj.scale += e.deltaY * -0.001;
      obj.scale = Math.max(0.1, Math.min(5, obj.scale));

      draw();
    });

    // 회전 (q, e)
    window.addEventListener('keydown', e => {
      if (!currentKey) return;
      if (e.key === 'q') images[currentKey].rotation -= 0.05;
      if (e.key === 'e') images[currentKey].rotation += 0.05;
      draw();
    });

    // 저장
    document.getElementById('saveBtn').addEventListener('click', () => {
      const link = document.createElement('a');
      link.download = 'edited_image.png';
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
    
    document.getElementById("bg-upload").addEventListener("change", function(e) {
    const img = document.getElementById("bg-image");
    img.src = URL.createObjectURL(e.target.files[0]);

    img.onload = () => {
        createStickers();   // 배경 이미지 로드 후 스티커 생성
    };
});

document.getElementById("save-btn").onclick = function() {
    const canvas = document.createElement("canvas");
    const bg = document.getElementById("bg-image");

    canvas.width = bg.width;
    canvas.height = bg.height;
    const ctx = canvas.getContext("2d");

    // 배경 그리기
    ctx.drawImage(bg, 0, 0, bg.width, bg.height);

    // 스티커 그리기
    document.querySelectorAll(".sticker").forEach(s => {
        const img = new Image();
        img.src = s.src;

        ctx.drawImage(
            img,
            parseInt(s.style.left),
            parseInt(s.style.top),
            s.width,
            s.height
        );
    });

    // PNG 저장
    const link = document.createElement("a");
    link.download = "sticker_result.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
};