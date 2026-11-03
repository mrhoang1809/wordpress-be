import { PrismaClient, RoleName, ContentStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ALL_PERMISSIONS = [
  // Pages
  { action: 'pages:list', description: 'List pages' },
  { action: 'pages:read', description: 'Read a page' },
  { action: 'pages:create', description: 'Create a page' },
  { action: 'pages:update', description: 'Update a page' },
  { action: 'pages:delete', description: 'Delete a page' },
  { action: 'pages:publish', description: 'Publish / unpublish a page' },
  // Posts
  { action: 'posts:list', description: 'List posts' },
  { action: 'posts:read', description: 'Read a post' },
  { action: 'posts:create', description: 'Create a post' },
  { action: 'posts:update', description: 'Update a post' },
  { action: 'posts:delete', description: 'Delete a post' },
  { action: 'posts:publish', description: 'Publish / unpublish a post' },
  // Categories
  { action: 'categories:list', description: 'List categories' },
  { action: 'categories:read', description: 'Read a category' },
  { action: 'categories:create', description: 'Create a category' },
  { action: 'categories:update', description: 'Update a category' },
  { action: 'categories:delete', description: 'Delete a category' },
  // Menus
  { action: 'menus:list', description: 'List menus' },
  { action: 'menus:read', description: 'Read a menu' },
  { action: 'menus:create', description: 'Create a menu' },
  { action: 'menus:update', description: 'Update a menu' },
  { action: 'menus:delete', description: 'Delete a menu' },
  // Media
  { action: 'media:list', description: 'List media' },
  { action: 'media:read', description: 'Read media' },
  { action: 'media:upload', description: 'Upload media' },
  { action: 'media:update', description: 'Update media metadata' },
  { action: 'media:delete', description: 'Delete media' },
  // Users
  { action: 'users:list', description: 'List users' },
  { action: 'users:read', description: 'Read user' },
  { action: 'users:create', description: 'Create user' },
  { action: 'users:update', description: 'Update user' },
  { action: 'users:delete', description: 'Delete user' },
  { action: 'users:manage-roles', description: 'Manage user roles' },
  // Settings
  { action: 'settings:read', description: 'Read site settings' },
  { action: 'settings:update', description: 'Update site settings' },
  // Locations
  { action: 'locations:list', description: 'List locations' },
  { action: 'locations:read', description: 'Read a location' },
  { action: 'locations:create', description: 'Create a location' },
  { action: 'locations:update', description: 'Update a location' },
  { action: 'locations:delete', description: 'Delete a location' },
  // Messaging — Campaigns
  { action: 'messages:list', description: 'List message campaigns' },
  { action: 'messages:read', description: 'Read a campaign' },
  { action: 'messages:create', description: 'Create a campaign' },
  { action: 'messages:update', description: 'Update a campaign' },
  { action: 'messages:delete', description: 'Delete a campaign' },
  { action: 'messages:send', description: 'Send / cancel a campaign' },
  // Messaging — Subscribers
  { action: 'subscribers:list', description: 'List subscribers' },
  { action: 'subscribers:read', description: 'Read a subscriber' },
  { action: 'subscribers:create', description: 'Create / import subscribers' },
  { action: 'subscribers:update', description: 'Update a subscriber' },
  { action: 'subscribers:delete', description: 'Delete a subscriber' },
  // Promotions
  { action: 'promotions:list', description: 'List promotion banners' },
  { action: 'promotions:read', description: 'Read a promotion banner' },
  { action: 'promotions:create', description: 'Create a promotion banner' },
  { action: 'promotions:update', description: 'Update / activate a promotion banner' },
  { action: 'promotions:delete', description: 'Delete a promotion banner' },
];

const ROLE_PERMISSIONS: Record<RoleName, string[]> = {
  [RoleName.ADMIN]: ALL_PERMISSIONS.map((p) => p.action),
  [RoleName.EDITOR]: [
    'pages:list', 'pages:read', 'pages:create', 'pages:update', 'pages:publish',
    'posts:list', 'posts:read', 'posts:create', 'posts:update', 'posts:publish',
    'categories:list', 'categories:read', 'categories:create', 'categories:update',
    'menus:list', 'menus:read', 'menus:update',
    'media:list', 'media:read', 'media:upload', 'media:update',
    'locations:list', 'locations:read', 'locations:create', 'locations:update',
    'messages:list', 'messages:read', 'messages:create', 'messages:update', 'messages:send',
    'subscribers:list', 'subscribers:read', 'subscribers:create', 'subscribers:update',
    'promotions:list', 'promotions:read', 'promotions:create', 'promotions:update',
  ],
  [RoleName.AUTHOR]: [
    'posts:list', 'posts:read', 'posts:create', 'posts:update',
    'media:list', 'media:read', 'media:upload',
  ],
};

const DEMO_LOCATIONS = [
  { name: 'Curves Nguyễn Đình Chiểu', slug: 'curves-nguyen-dinh-chieu', address: '63 Nguyễn Đình Chiểu, P. Đa Kao, Q.1, TP.HCM', phone: '(028) 3820 1234', order: 1, isActive: true },
  { name: 'Curves Lê Văn Sỹ', slug: 'curves-le-van-sy', address: '189 Lê Văn Sỹ, P. 13, Q. Phú Nhuận, TP.HCM', phone: '(028) 3844 5678', order: 2, isActive: true },
  { name: 'Curves Trần Não', slug: 'curves-tran-nao', address: '20 Trần Não, P. Bình An, TP. Thủ Đức, TP.HCM', phone: '(028) 3740 9012', order: 3, isActive: true },
  { name: 'Curves Kim Mã', slug: 'curves-kim-ma', address: '18 Kim Mã, Ba Đình, Hà Nội', phone: '(024) 3726 3456', order: 4, isActive: true },
  { name: 'Curves Tây Sơn', slug: 'curves-tay-son', address: '88 Tây Sơn, Đống Đa, Hà Nội', phone: '(024) 3573 7890', order: 5, isActive: true },
  { name: 'Curves Nguyễn Văn Linh', slug: 'curves-nguyen-van-linh', address: '45 Nguyễn Văn Linh, Hải Châu, Đà Nẵng', phone: '(0236) 3888 012', order: 6, isActive: true },
  { name: 'Curves Lê Lợi', slug: 'curves-le-loi', address: '27 Lê Lợi, Thanh Hóa', phone: '(0237) 3912 345', order: 7, isActive: true },
  { name: 'Curves Nguyễn Trãi', slug: 'curves-nguyen-trai', address: '234 Nguyễn Trãi, Q.5, TP.HCM', phone: '(028) 3830 5678', order: 8, isActive: true },
  { name: 'Curves Pasteur', slug: 'curves-pasteur', address: '100 Pasteur, Q.1, TP.HCM', phone: '(028) 3822 3456', order: 9, isActive: true },
  { name: 'Curves Hoàng Diệu', slug: 'curves-hoang-dieu', address: '125 Hoàng Diệu, Q.4, TP.HCM', phone: '(028) 3835 6789', order: 10, isActive: true },
];

async function main() {
  console.log('🌱 Seeding database...');

  for (const perm of ALL_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { action: perm.action },
      update: { description: perm.description },
      create: perm,
    });
  }

  for (const roleName of [RoleName.ADMIN, RoleName.EDITOR, RoleName.AUTHOR]) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName, description: `${roleName} role` },
    });
  }

  for (const [roleName, permActions] of Object.entries(ROLE_PERMISSIONS)) {
    const role = await prisma.role.findUnique({ where: { name: roleName as RoleName } });
    if (!role) continue;
    for (const action of permActions) {
      const perm = await prisma.permission.findUnique({ where: { action } });
      if (!perm) continue;
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
        update: {},
        create: { roleId: role.id, permissionId: perm.id },
      });
    }
  }

  const adminRole = await prisma.role.findUnique({ where: { name: RoleName.ADMIN } });
  const existingAdmin = await prisma.user.findUnique({ where: { email: 'admin@cms.local' } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('Admin@1234', 12);
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@cms.local',
        passwordHash,
        firstName: 'Super',
        lastName: 'Admin',
        status: 'ACTIVE',
      },
    });
    if (adminRole) {
      await prisma.userRole.create({
        data: { userId: adminUser.id, roleId: adminRole.id },
      });
    }
    console.log(`✅ Admin user created: admin@cms.local / Admin@1234`);
  } else {
    console.log(`ℹ️  Admin user already exists`);
  }

  const existingSettings = await prisma.siteSetting.findFirst();
  if (!existingSettings) {
    await prisma.siteSetting.create({
      data: {
        siteName: 'My CMS Site',
        siteDescription: 'A powerful CMS built with NestJS and Next.js',
        defaultSeoTitle: 'My CMS Site',
        defaultSeoDescription: 'Welcome to My CMS Site',
      },
    });
  }

  const admin = await prisma.user.findUnique({ where: { email: 'admin@cms.local' } });
  if (admin) {
    const headerMenu = await prisma.menu.findUnique({ where: { location: 'HEADER' } });
    if (!headerMenu) {
      await prisma.menu.create({ data: { name: 'Header Navigation', location: 'HEADER' } });
    }

    const sampleCategory = await prisma.category.findUnique({ where: { slug: 'news' } });
    if (!sampleCategory) {
      await prisma.category.create({ data: { name: 'News', slug: 'news', description: 'Latest news' } });
    }

    const blogCatsInput = [
      { name: 'Dinh Dưỡng & Eat Clean', slug: 'dinh-duong', description: 'Thực đơn và mẹo dinh dưỡng' },
      { name: 'Bài Tập 30 Phút', slug: 'bai-tap', description: 'Hướng dẫn tập luyện 30 phút' },
      { name: 'Sức Khỏe & Thể Trạng', slug: 'suc-khoe', description: 'Kiến thức sức khỏe' },
      { name: 'Câu Chuyện Truyền Cảm Hứng', slug: 'truyen-cam-hung', description: 'Hành trình thay đổi' },
    ];

    // Create/update categories and store their IDs
    const blogCats: Array<{ name: string; slug: string; description: string; id: string }> = [];
    for (const cat of blogCatsInput) {
      const created = await prisma.category.upsert({ where: { slug: cat.slug }, create: cat, update: {} });
      blogCats.push({ ...cat, id: created.id });
    }

    // Add sample stories
    const storyCategory = await prisma.category.findUnique({ where: { slug: 'truyen-cam-hung' } });
    if (storyCategory && admin) {
      const allStories = [
        {
          title: 'Chị Minh Anh: Từ 60kg xuống 53kg chỉ sau 3 tháng',
          slug: 'chi-minh-anh-tu-60kg-xuong-53kg-chi-sau-3-thang',
          excerpt: 'Là nhân viên văn phòng bận rộn, chị từng nghĩ không thể sắp xếp tập gym. Nhưng với Curves 30 phút tranh thủ giờ trưa, chị đã duy trì suốt 1 năm qua và giảm được 6.5kg.',
          status: ContentStatus.PUBLISHED,
          publishedAt: new Date(),
          authorId: admin.id,
        },
        {
          title: 'Cô Thanh Hương: Ở tuổi 52 vẫn khỏe mạnh và tràn đầy năng lượng',
          slug: 'co-thanh-huong-o-tuoi-52-van-khoe-manh-va-tran-day-nang-luong',
          excerpt: 'Cô Thanh Hương chia sẻ hành trình tìm lại sức khỏe nhờ máy kháng thủy lực tại Curves Hà Nội.',
          status: ContentStatus.PUBLISHED,
          publishedAt: new Date(),
          authorId: admin.id,
        },
        {
          title: 'Bạn Thu Thảo: Tự tin diện đồ ôm body sau hành trình giảm 9kg',
          slug: 'ban-thu-thao-tu-tin-dien-do-om-body-sau-hanh-trinh-giam-9kg',
          excerpt: 'Môi trường 100% nữ giúp bạn Thu Thảo tự tin hoàn toàn, không ngại ngùng gì cả. Nhờ kiên trì mỗi tuần 3 buổi 30 phút mà mình đã tự tin diện đồ ôm body dự tiệc!',
          status: ContentStatus.PUBLISHED,
          publishedAt: new Date(),
          authorId: admin.id,
        },
        {
          title: 'Chị Lan Phương: Giảm vòng eo 10cm sau 6 tháng',
          slug: 'chi-lan-phuong-giam-vong-eo-10cm-sau-6-thang',
          excerpt: 'Chị Lan Phương chia sẻ hành trình giảm vòng eo 10cm và cải thiện sức khỏe tại Curves Đà Nẵng.',
          status: ContentStatus.PUBLISHED,
          publishedAt: new Date(),
          authorId: admin.id,
        },
        {
          title: 'Cô Mai Anh: Từ người phụ nữ tự ti đến tự tin rạng rỡ',
          slug: 'co-mai-anh-tu-nguoi-phu-nu-tu-ti-den-tu-tin-rang-ro',
          excerpt: 'Cô Mai Anh chia sẻ hành trình tìm lại niềm vui sống và tự tin sau hành trình giảm cân tại Curves.',
          status: ContentStatus.PUBLISHED,
          publishedAt: new Date(),
          authorId: admin.id,
        },
        {
          title: 'Chị Hoa: Từ 70kg xuống 60kg sau 4 tháng',
          slug: 'chi-hoa-tu-70kg-xuong-60kg-sau-4-thang',
          excerpt: 'Chị Hoa chia sẻ hành trình giảm cân bền vững tại Curves TP.HCM.',
          status: ContentStatus.PUBLISHED,
          publishedAt: new Date(),
          authorId: admin.id,
        },
        {
          title: 'Cô Hồng: Cải thiện sức khỏe tim mạch nhờ Curves',
          slug: 'co-hong-cai-thien-suc-khoe-tim-mach-nho-curves',
          excerpt: 'Cô Hồng chia sẻ hành trình cải thiện sức khỏe tim mạch sau 6 tháng tập luyện.',
          status: ContentStatus.PUBLISHED,
          publishedAt: new Date(),
          authorId: admin.id,
        },
        {
          title: 'Bạn Vy: Tự tin diện bikini mùa hè sau hành trình giảm 8kg',
          slug: 'ban-vy-tu-tin-dien-bikini-mua-he-sau-hanh-trinh-giam-8kg',
          excerpt: 'Bạn Vy chia sẻ hành trình tự tin diện bikini mùa hè sau khi giảm 8kg.',
          status: ContentStatus.PUBLISHED,
          publishedAt: new Date(),
          authorId: admin.id,
        },
        {
          title: 'Chị Nguyệt: Từ mất ngủ đến khỏe mạnh mỗi sáng',
          slug: 'chi-nguyet-tu-mat-ngu-den-khoe-manh-moi-sang',
          excerpt: 'Chị Nguyệt chia sẻ hành trình cải thiện giấc ngủ nhờ Curves.',
          status: ContentStatus.PUBLISHED,
          publishedAt: new Date(),
          authorId: admin.id,
        },
        {
          title: 'Cô Hạnh: Săn chắc cơ bắp sau sinh',
          slug: 'co-han-san-chac-co-bap-sau-sinh',
          excerpt: 'Cô Hạnh chia sẻ hành trình lấy lại vóc dáng sau sinh nhờ Curves.',
          status: ContentStatus.PUBLISHED,
          publishedAt: new Date(),
          authorId: admin.id,
        },
      ];

      for (const story of allStories) {
        const post = await prisma.post.upsert({
          where: { slug: story.slug },
          update: {},
          create: story,
        });
        await prisma.postCategory.upsert({
          where: {
            postId_categoryId: {
              postId: post.id,
              categoryId: storyCategory.id,
            },
          },
          update: {},
          create: { postId: post.id, categoryId: storyCategory.id },
        });
      }
      console.log(`✅ ${allStories.length} Stories seeded`);
    }

    const existingBanner = await prisma.promotionBanner.findFirst();
    if (!existingBanner) {
      const endsAt = new Date();
      endsAt.setDate(endsAt.getDate() + 7);
      await prisma.promotionBanner.create({
        data: {
          badgeText: 'Ưu Đãi Tháng Này',
          headline: 'Tặng 01 Buổi Phân Tích InBody & 3 Ngày Tập Thử Miễn Phí',
          description: 'Nhận ngay gói trải nghiệm toàn bộ máy kháng thủy lực...',
          ctaLabel: '🎁 ĐĂNG KÝ NGAY',
          ctaSource: 'Seed',
          countdownLabel: 'Chương trình kết thúc sau:',
          endsAt,
          isActive: true,
        },
      });
      console.log('✅ Sample promotion banner created');
    }
  }

  for (const location of DEMO_LOCATIONS) {
    await prisma.location.upsert({
      where: { slug: location.slug },
      update: {},
      create: location,
    });
  }
  console.log(`✅ ${DEMO_LOCATIONS.length} Locations seeded`);

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

