const ContentPage = require("./content.model");

const text = (vi, en = vi, zh = vi) => ({ vi, en, zh });

const policyActions = [
  { href: "/lien-he", label: text("Lien he ho tro") },
  { href: "/ho-tro/faq", label: text("FAQ"), variant: "outline" },
];

const policySections = {
  "bao-mat": [
    {
      heading: text("Thong tin duoc thu thap", "Collected information", "收集的信息"),
      items: [
        text("Ho ten, so dien thoai, email va dia chi giao hang khi khach hang tao don."),
        text("Lich su mua hang, lich hen va yeu cau tu van de ho tro cham soc tot hon."),
        text("Thong tin ky thuat co ban nhu thiet bi, trinh duyet va hanh vi truy cap website."),
      ],
    },
    {
      heading: text("Muc dich su dung", "Usage purposes", "使用目的"),
      items: [
        text("Xu ly don hang, giao hang, xac nhan thanh toan va cham soc sau ban."),
        text("Gui thong bao quan trong ve don hang, lich hen, tai khoan va uu dai phu hop."),
        text("Cai thien trai nghiem website, san pham va dich vu tu van."),
      ],
    },
    {
      heading: text("Bao ve du lieu", "Data protection", "数据保护"),
      items: [
        text("Thong tin tai khoan duoc han che truy cap theo pham vi can thiet."),
        text("Khach hang co the yeu cau cap nhat hoac xoa thong tin khong con can thiet."),
      ],
    },
  ],
  "dieu-khoan": [
    {
      heading: text("Pham vi ap dung", "Scope", "适用范围"),
      items: [
        text("Dieu khoan nay ap dung cho website, tai khoan khach hang, don hang va cac dich vu lien quan."),
        text("Khi tiep tuc su dung website, khach hang dong y voi cac quy dinh hien hanh."),
      ],
    },
    {
      heading: text("Tai khoan va bao mat", "Account security", "账户安全"),
      items: [
        text("Khach hang chiu trach nhiem bao mat thong tin dang nhap cua minh."),
        text("Thong tin dang ky can chinh xac de viec giao hang va ho tro dien ra thuan loi."),
      ],
    },
    {
      heading: text("Noi dung va tu van", "Content and consultation", "内容与咨询"),
      items: [
        text("Noi dung suc khoe tren website chi mang tinh tham khao."),
        text("Khach hang nen tham van nhan vien y te khi co benh ly nen, dang dung thuoc hoac co trieu chung bat thuong."),
      ],
    },
  ],
  "doi-tra": [
    {
      heading: text("Dieu kien doi tra", "Return conditions", "退换条件"),
      items: [
        text("San pham con nguyen tem, nhan, bao bi va chua qua su dung."),
        text("San pham bi loi do van chuyen, sai mat hang hoac khong dung thong tin dat hang."),
        text("Yeu cau doi tra can duoc gui trong thoi gian quy dinh ke tu khi nhan hang."),
      ],
    },
    {
      heading: text("Quy trinh xu ly", "Processing flow", "处理流程"),
      items: [
        text("Khach hang lien he bo phan ho tro va cung cap hinh anh san pham, ma don hang."),
        text("An Gia Green kiem tra thong tin va phan hoi phuong an doi tra phu hop."),
      ],
    },
  ],
  "van-chuyen": [
    {
      heading: text("Pham vi giao hang", "Delivery coverage", "配送范围"),
      items: [
        text("Ho tro giao hang tren toan quoc thong qua doi tac van chuyen."),
        text("Mot so khu vuc xa co the can them thoi gian xu ly va phi phu thu."),
      ],
    },
    {
      heading: text("Thoi gian giao hang", "Delivery time", "配送时间"),
      items: [
        text("Noi thanh: du kien 1-2 ngay lam viec sau khi xac nhan don."),
        text("Tinh thanh khac: du kien 3-5 ngay lam viec tuy khu vuc."),
      ],
    },
  ],
  "thanh-toan": [
    {
      heading: text("Hinh thuc ho tro", "Supported methods", "支持方式"),
      items: [
        text("Thanh toan khi nhan hang (COD)."),
        text("Chuyen khoan ngan hang theo thong tin duoc xac nhan trong don."),
        text("Cong thanh toan truc tuyen se duoc kich hoat theo tung giai doan tich hop."),
      ],
    },
    {
      heading: text("Luu y an toan", "Safety notes", "安全提示"),
      items: [
        text("Khach hang chi thanh toan theo thong tin chinh thuc tu An Gia Green."),
        text("Khong chia se ma OTP, mat khau hoac thong tin the cho bat ky ben nao."),
      ],
    },
  ],
};

const contentPages = [
  {
    key: "policy.bao-mat",
    group: "policy",
    order: 10,
    badge: "Policy",
    icon: "ShieldCheck",
    title: text("Chinh sach bao mat", "Privacy policy", "隐私政策"),
    description: text("Cach An Gia Green thu thap, bao ve va su dung thong tin ca nhan cua khach hang."),
    highlights: [
      { label: text("Cap nhat"), value: "2026" },
      { label: text("Ho tro"), value: "24/7" },
    ],
    actions: policyActions,
    sections: policySections["bao-mat"],
  },
  {
    key: "policy.dieu-khoan",
    group: "policy",
    order: 20,
    badge: "Policy",
    icon: "FileText",
    title: text("Dieu khoan su dung", "Terms of use", "使用条款"),
    description: text("Cac dieu kien su dung website, dich vu mua sam, thanh vien va tu van."),
    highlights: [
      { label: text("Cap nhat"), value: "2026" },
      { label: text("Ho tro"), value: "24/7" },
    ],
    actions: policyActions,
    sections: policySections["dieu-khoan"],
  },
  {
    key: "policy.doi-tra",
    group: "policy",
    order: 30,
    badge: "Policy",
    icon: "RefreshCcw",
    title: text("Chinh sach doi tra", "Return policy", "退换政策"),
    description: text("Huong dan dieu kien doi tra san pham va quy trinh tiep nhan yeu cau ho tro sau mua."),
    highlights: [
      { label: text("Cap nhat"), value: "2026" },
      { label: text("Ho tro"), value: "24/7" },
    ],
    actions: policyActions,
    sections: policySections["doi-tra"],
  },
  {
    key: "policy.van-chuyen",
    group: "policy",
    order: 40,
    badge: "Policy",
    icon: "Truck",
    title: text("Chinh sach van chuyen", "Shipping policy", "配送政策"),
    description: text("Thong tin ve pham vi giao hang, thoi gian du kien, phi van chuyen va cach theo doi don."),
    highlights: [
      { label: text("Cap nhat"), value: "2026" },
      { label: text("Ho tro"), value: "24/7" },
    ],
    actions: policyActions,
    sections: policySections["van-chuyen"],
  },
  {
    key: "policy.thanh-toan",
    group: "policy",
    order: 50,
    badge: "Policy",
    icon: "CreditCard",
    title: text("Phuong thuc thanh toan", "Payment methods", "支付方式"),
    description: text("Cac phuong thuc thanh toan duoc ho tro khi mua san pham va dang ky goi cham soc."),
    highlights: [
      { label: text("Cap nhat"), value: "2026" },
      { label: text("Ho tro"), value: "24/7" },
    ],
    actions: policyActions,
    sections: policySections["thanh-toan"],
  },
  {
    key: "support.shopping-guide",
    group: "support",
    order: 10,
    badge: "Support",
    icon: "ShoppingCart",
    title: text("Huong dan mua hang", "Shopping guide", "购物指南"),
    description: text("Huong dan cac buoc mua san pham tren website An Gia Green."),
    highlights: [
      { label: text("Buoc mua hang"), value: "4" },
      { label: text("Ho tro hotline"), value: "1900" },
    ],
    actions: [
      { href: "/san-pham", label: text("Mua sam ngay") },
      { href: "/lien-he", label: text("Can ho tro"), variant: "outline" },
    ],
    cards: [
      { icon: "ShoppingCart", title: text("1. Chon san pham"), text: text("Truy cap danh muc san pham, xem chi tiet, chon so luong va them vao gio hang.") },
      { icon: "PackageCheck", title: text("2. Kiem tra gio hang"), text: text("Xem lai san pham, so luong, gia tam tinh va uu dai neu co.") },
      { icon: "CreditCard", title: text("3. Dien thong tin thanh toan"), text: text("Nhap thong tin nguoi nhan, dia chi giao hang, phuong thuc thanh toan va ghi chu.") },
      { icon: "Truck", title: text("4. Theo doi giao hang"), text: text("Sau khi dat hang, ban co the theo doi trang thai don trong khu vuc tai khoan.") },
    ],
  },
  {
    key: "support.faq",
    group: "support",
    order: 20,
    badge: "FAQ",
    icon: "HelpCircle",
    title: text("Cau hoi thuong gap", "Frequently asked questions", "常见问题"),
    description: text("Cac cau hoi thuong gap ve mua hang, san pham, thanh vien, tu van va ho tro sau ban."),
    highlights: [
      { label: text("Cau hoi pho bien"), value: "5" },
      { label: text("Kenh ho tro"), value: "2" },
    ],
    actions: [
      { href: "/lien-he", label: text("Gui cau hoi") },
      { href: "/ho-tro/huong-dan-mua-hang", label: text("Huong dan mua hang"), variant: "outline" },
    ],
    faqs: [
      { question: text("San pham An Gia Green co phai la thuoc khong?"), answer: text("Phan lon san pham la thuc pham, tra thao duoc hoac san pham cham soc suc khoe. Noi dung tren website khong thay the chan doan hay dieu tri y khoa.") },
      { question: text("Toi co the dat lich tu van truoc khi mua khong?"), answer: text("Co. Ban co the vao trang Tu van de chon hinh thuc, chuyen gia va khung gio phu hop.") },
      { question: text("Lam sao de theo doi don hang?"), answer: text("Sau khi dang nhap, vao Tai khoan > Don hang de xem trang thai don.") },
      { question: text("Co thanh toan khi nhan hang khong?"), answer: text("Co. Website ho tro COD va se bo sung them cac cong thanh toan truc tuyen theo tung giai doan.") },
      { question: text("Diem thanh vien duoc tinh nhu the nao?"), answer: text("Diem va uu dai duoc tinh theo cap bac thanh vien, gia tri mua hang va chuong trinh dang ap dung.") },
    ],
  },
  {
    key: "career.index",
    group: "career",
    order: 10,
    badge: "Careers",
    icon: "BriefcaseBusiness",
    title: text("Tuyen dung", "Careers", "招聘"),
    description: text("Gia nhap An Gia Green de cung xay dung he sinh thai duoc lieu sach va cham soc suc khoe chu dong."),
    highlights: [
      { label: text("Vi tri mo"), value: "3" },
      { label: text("Gia tri cot loi"), value: "3" },
    ],
    actions: [
      { href: "mailto:info@angiagreen.vn", label: text("Gui CV") },
      { href: "/lien-he", label: text("Lien he nhan su"), variant: "outline" },
    ],
    cards: [
      { icon: "Leaf", title: text("Song xanh"), text: text("Lam viec trong he sinh thai coi trong nguon nguyen lieu sach va ben vung.") },
      { icon: "Users", title: text("Dong doi"), text: text("Moi truong hop tac, ton trong y kien va hoc hoi lien tuc.") },
      { icon: "HeartHandshake", title: text("Phuc vu khach hang"), text: text("Dat suc khoe va trai nghiem khach hang lam trung tam.") },
    ],
    jobs: [
      { title: text("Nhan vien tu van san pham"), location: text("TP. Ho Chi Minh"), type: "Full-time" },
      { title: text("Chuyen vien noi dung suc khoe"), location: text("Hybrid"), type: "Full-time" },
      { title: text("Nhan vien van hanh don hang"), location: text("TP. Ho Chi Minh"), type: "Full-time" },
    ],
  },
  {
    key: "marketing.folk-remedies",
    group: "marketing",
    order: 10,
    badge: "Folk Remedies",
    icon: "BookOpen",
    title: text("Bai thuoc dan gian"),
    description: text("Tong hop kien thuc thao duoc va bai thuoc dan gian duoc bien soan theo huong de doc, de ap dung va luon khuyen nghi tham van chuyen gia khi can."),
    highlights: [
      { label: text("Bai viet tham khao"), value: "0" },
      { label: text("Chu de suc khoe"), value: "8+" },
    ],
    actions: [
      { href: "/tu-van", label: text("Hoi chuyen gia") },
      { href: "/tin-tuc", label: text("Tin tuc suc khoe"), variant: "outline" },
    ],
    cards: [
      { icon: "Leaf", title: text("Nguon goc tu thao duoc"), text: text("Tap trung vao cac bai viet co lien quan den duoc lieu va cham soc suc khoe chu dong.") },
      { icon: "ShieldCheck", title: text("Can than khi ap dung"), text: text("Khung noi dung nhan manh viec dung dung cach, dung lieu va hoi y kien chuyen gia.") },
      { icon: "BookOpen", title: text("De tra cuu"), text: text("Sap xep theo bai viet va tag de nguoi dung tim nhanh chu de can doc.") },
    ],
  },
  {
    key: "marketing.medical-consultants",
    group: "marketing",
    order: 20,
    badge: "Medical Consultation",
    icon: "Stethoscope",
    title: text("Tu van cung y si"),
    description: text("Ket noi voi doi ngu y si, duoc si va chuyen gia cham soc suc khoe de duoc huong dan dung san pham va dat lich tu van phu hop."),
    highlights: [
      { label: text("Chuyen gia hien co"), value: "0" },
      { label: text("Hinh thuc tu van"), value: "3" },
    ],
    actions: [
      { href: "/tu-van", label: text("Dat lich tu van") },
      { href: "/chuyen-gia", label: text("Xem doi ngu"), variant: "outline" },
    ],
    cards: [
      { icon: "Phone", title: text("Tu van qua dien thoai"), text: text("Phu hop voi nhu cau can trao doi nhanh va ro rang.") },
      { icon: "MessageCircle", title: text("Tu van qua chat"), text: text("Gui cau hoi va nhan huong dan theo tung van de suc khoe.") },
      { icon: "CalendarCheck", title: text("Dat lich linh hoat"), text: text("Chon chuyen gia, ngay gio va chu de tu van mong muon.") },
    ],
  },
  {
    key: "marketing.membership-packages",
    group: "marketing",
    order: 30,
    badge: "Membership Combo",
    icon: "Crown",
    title: text("Combo thanh vien An Gia Green"),
    description: text("Lua chon goi cham soc suc khoe theo nhu cau, ket hop san pham thao duoc, uu dai mua sam va tu van dinh ky."),
    highlights: [
      { label: text("Goi linh hoat"), value: "4+" },
      { label: text("Uu dai toi da"), value: "15%" },
    ],
    actions: [
      { href: "/thanh-vien", label: text("Xem cap bac"), variant: "outline" },
      { href: "/tu-van", label: text("Can tu van") },
    ],
    cards: [
      { icon: "Gift", title: text("Qua tang dinh ky"), text: text("Nhan goi san pham va uu dai rieng theo tung chu ky cham soc.") },
      { icon: "ShieldCheck", title: text("Dam bao chat luong"), text: text("San pham duoc chon loc tu he sinh thai duoc lieu sach.") },
      { icon: "Sparkles", title: text("Cham soc chu dong"), text: text("Ket hop mua sam, tich diem va tu van de theo doi suc khoe lau dai.") },
    ],
  },
  {
    key: "marketing.membership-package-detail",
    group: "marketing",
    order: 40,
    badge: "Membership Detail",
    icon: "ShieldCheck",
    title: text("Quyen loi bo sung cua goi"),
    description: text("Cac loi ich ho tro them khi khach hang dang ky goi thanh vien."),
    cards: [
      { icon: "ShieldCheck", title: text("Nhac lich dinh ky"), text: text("Duoc nhac lich su dung va tai dat goi dinh ky.") },
      { icon: "ShieldCheck", title: text("Uu tien cap nhat"), text: text("Uu tien tiep can cac chuong trinh cham soc suc khoe moi.") },
      { icon: "ShieldCheck", title: text("Nang cap thanh vien"), text: text("Co the nang cap len cap thanh vien cao hon khi dat muc chi tieu.") },
    ],
  },
];

const seedContentPages = async () => {
  await ContentPage.bulkWrite(
    contentPages.map((page) => ({
      updateOne: {
        filter: { key: page.key },
        update: { $set: page },
        upsert: true,
      },
    }))
  );

  console.log(`Content pages: ${contentPages.length} records upserted`);
};

module.exports = { contentPages, seedContentPages };
