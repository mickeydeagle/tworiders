<!doctype html>
<html lang="en">
<head>

  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <link rel="apple-touch-icon" sizes="180x180" href="/assets/images/apple-touch-icon.png">
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/images/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/assets/images/favicon-16x16.png">
  <link rel="manifest" href="/assets/images/site.webmanifest">
  <link rel="mask-icon" href="/assets/images/safari-pinned-tab.svg" color="#5bbad5">
  <link rel="stylesheet" type="text/css" href="https://cloud.typography.com/6907656/6470032/css/fonts.css" />
  <meta name="msapplication-TileColor" content="#2d89ef">
  <meta name="theme-color" content="#ffffff">

  <?php if($page->isHomePage()): ?>
  <meta name="description" content="The bicycle journal of two riders on loaded touring bikes. The story of two treks across the United States: Oregon to Virginia and Florida to California.">
  <?php endif; ?>

  <!-- Google Tag Manager -->
  <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-TQ44ZHX');</script>
  <!-- End Google Tag Manager -->

  <?php if($page->isHomePage()): ?>
  <title><?= $site->title() ?> &middot; A Bicycle Journal</title>
  <?php else: ?>
  <title><?= $site->title() ?> &middot; <?= $page->title() ?></title>
  <?php endif; ?>

  <link rel="stylesheet" href="https://use.typekit.net/iyv3jkh.css">

  <?= css(['assets/css/index.css', '@auto']) ?>
  <?= css('assets/css/simplelightbox.css') ?>

</head>
<body>

  <!-- Google Tag Manager (noscript) -->
  <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TQ44ZHX"
  height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
  <!-- End Google Tag Manager (noscript) -->

  <div class="page">
    <header class="header">
      <a class="logo" href="<?= $site->url() ?>"><img src="/assets/images/two-riders-logo.png" style="height:4rem;width:auto;" /></a>

      <nav id="menu" class="menu">
        <?php foreach ($site->children()->listed() as $item): ?>
        <?= $item->title()->link() ?>
        <?php endforeach ?>
      </nav>
    </header>

