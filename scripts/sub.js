// Can't inspect element, contextmenu

// document.addEventListener("contextmenu", (e) => e.preventDefault());

// function ctrlShiftKey(e, keyCode) {
// 	return e.ctrlKey && e.shiftKey && e.keyCode === keyCode.charCodeAt(0);
// }

// Disable F12, Ctrl + Shift + I, Ctrl + Shift + J, Ctrl + U

// document.onkeydown = (e) => {
// 	if (
// 		event.keyCode === 123 ||
// 		ctrlShiftKey(e, "I") ||
// 		ctrlShiftKey(e, "J") ||
// 		ctrlShiftKey(e, "C") ||
// 		(e.ctrlKey && e.keyCode === "U".charCodeAt(0))
// 	) {
// 		return false;
// 	}
// };

// Lấy tất cả các thẻ <img> trên trang
var images = document.getElementsByTagName("img");

// Duyệt qua từng thẻ <img> và thêm thuộc tính loading="lazy"
for (var i = 0; i < images.length; i++) {
	images[i].setAttribute("loading", "lazy");
}
