<?php snippet('header') ?>

<header class="album-header">
  <?php if ($cover = $page->cover()): ?>
  <figure class="album-cover">
    <?= $cover->crop(1200, 780) ?>
    <figcaption>
      <h1><?= $page->headline()->or($page->title()) ?></h1>
    </figcaption>
  </figure>
  <?php endif ?>
</header>

<main class="album">
  <article>

    <div class="album-text text">
      <?= $page->description()->kt() ?>

      <?php if ($page->tags()->isNotEmpty()): ?>
      <p class="album-tags tags"><?= $page->tags() ?></p>
      <?php endif ?>
    </div>

    <ul class="album-gallery"<?= attr(['data-even' => $gallery->isEven(), 'data-count' => $gallery->count()], ' ') ?>>
      <?php foreach ($gallery as $image): ?>
      <li>
        <figure>
          <a href="<?= $image->link()->or($image->url()) ?>">
            <?= $image->crop(800, 1000) ?>
          </a>
        </figure>
      </li>
      <?php endforeach ?>
    </ul>

    <div class="post-navigation">
      <?php if($prev = $page->prev()): ?>
        <?php if (!empty($page->prev()->num())): ?>
          <div class="prev">
            <a href="<?= $prev->url() ?>">Prev.<span class="dot"></span><span class="post-navigation-title"><?= $page->prev()->shortname() ?></span></a>
          </div>
        <?php endif ?>
      <?php endif ?>

      <?php if($next = $page->next()): ?>
        <?php if (!empty($page->next()->num())): ?>
          <div class="next">
            <a href="<?= $next->url() ?>"><span class="post-navigation-title"><?= $page->next()->shortname() ?></span><span class="dot"></span>Next</a>
          </div>
        <?php endif ?>
      <?php endif ?>
    </div>

  </article>
</main>

<?php snippet('footer') ?>
