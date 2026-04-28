# Ecom Template (Static HTML)

โปรเจคนี้เป็นเทมเพลตเว็บ eCommerce แบบ Static (HTML/CSS/JS) สำหรับแสดงหน้า Shop, Blog, Product, Cart และ Checkout โดยไม่พึ่งพา Backend เหมาะสำหรับการเรียนรู้โครงสร้างหน้าเว็บ, ทำ UI demo, หรือปรับแต่งเป็นธีมของตัวเอง

## ไฮไลต์หลัก
- โครงสร้างหน้า eCommerce ครบ: หน้าแรก, หน้าร้านค้า, รายละเอียดสินค้า, ตะกร้า, ชำระเงิน
- มีหน้า Blog หลายรูปแบบ (Audio/Video/Gallery)
- ใช้ Bootstrap 4 พร้อมปลั๊กอิน UI ต่างๆ (เช่น carousel, popup, animation)
- รองรับ Responsive ด้วยไฟล์ CSS เฉพาะ

## โครงสร้างโปรเจค
- ไฟล์หน้าเว็บหลักอยู่ที่ root (เช่น index.html, shop-left-sidebar.html, product-details.html)
- css/ = ไฟล์ CSS รวม Bootstrap และปลั๊กอิน
- js/ = ไฟล์ JavaScript และปลั๊กอิน
- images/ = รูปภาพทั้งหมด
- fonts/ = ฟอนต์ที่ใช้
- theia-sticky-sidebar/ = ปลั๊กอิน sidebar ที่ใช้ในบางหน้า

## วิธีเปิดใช้งาน
เปิดไฟล์ HTML ด้วยเบราว์เซอร์ได้ทันที เช่น
- index.html
- shop-left-sidebar.html
- blog-video-format.html

ถ้าต้องการเปิดแบบ localhost (แนะนำสำหรับปลั๊กอินบางตัว)
- ใช้ VS Code Live Server หรือเปิดด้วย web server แบบง่าย

## การปรับแต่งเนื้อหา
### เปลี่ยนข้อความหรือรูป
- เปิดไฟล์หน้าที่ต้องการแก้ (เช่น shop-left-sidebar.html)
- แก้ไขข้อความใน HTML และเปลี่ยนรูปใน images/

### เพิ่ม/ลบสินค้าในหน้าร้านค้า
1. ไปที่หน้า shop-left-sidebar.html
2. คัดลอกบล็อกสินค้าในส่วน grid-view (`div.single-product-wrap`)
3. วางบล็อกใหม่ใน `div.row` และแก้ชื่อ/ราคา/รูป

### ปรับสีและธีม
- แก้ที่ style.css หรือไฟล์ใน css/
- แนะนำให้สร้างไฟล์ custom.css แล้วลิงก์เพิ่ม เพื่อแยกการปรับแต่งออกจากไฟล์หลัก

## หน้าใช้งานบ่อย
- หน้าแรก: index.html
- หน้าร้านค้า (ซ้าย): shop-left-sidebar.html
- รายละเอียดสินค้า: single-product.html
- ตะกร้า: shopping-cart.html
- ชำระเงิน: checkout.html
- บล็อก (วิดีโอ): blog-video-format.html

## ข้อจำกัดที่ควรรู้
- โปรเจคนี้เป็น Static Template ไม่มีระบบตะกร้าจริงและระบบชำระเงินจริง
- ลิงก์บางส่วนเป็น placeholder (href="#") ต้องเชื่อมด้วยตัวเอง
- หากต้องการเชื่อม Backend ต้องทำ API และเปลี่ยนการโหลดข้อมูลสินค้าเอง

## แนวทางต่อยอด
- เชื่อมกับ Backend (เช่น Node.js/Express, Laravel) เพื่อดึงข้อมูลสินค้าแบบไดนามิก
- เปลี่ยนเป็นโครงสร้าง Component (เช่น React/Vue) เพื่อจัดการง่ายขึ้น
- สร้างระบบตะกร้าและชำระเงินจริง

## แหล่งอ้างอิงปลั๊กอิน
ปลั๊กอินส่วนใหญ่ถูกเรียกจากโฟลเดอร์ js/ และ css/ ในโปรเจคนี้
สามารถอัปเดตเวอร์ชันหรือแทนที่ด้วยปลั๊กอินอื่นได้ตามต้องการ
