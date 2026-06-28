<?php snippet('header') ?>

<main>
  <article class="note">
    <header class="note-header intro">
      <h1><?= $page->title() ?></h1>
      <div class="note-byline">
        <?php if ($author = $page->author()->toUser()): ?>
          By <?= $author->name() ?><span class="dot"></span><?php endif ?><time><?= $page->date()->toDate('F j, Y') ?></time>
      </div>
    </header>

    <div class="note-text text">
      <?= $page->text()->kt() ?>
    </div>
  </article>

  <div class="post-navigation">
    <?php if($prev = $page->prev()): ?>
      <div class="prev">
        <a href="<?= $prev->url() ?>">Prev.<span class="dot"></span><span class="post-navigation-title"><?= $page->prev()->shortname() ?></span></a>
      </div>
    <?php endif ?>

    <?php if($next = $page->next()): ?>
      <div class="next">
        <a href="<?= $next->url() ?>"><span class="post-navigation-title"><?= $page->next()->shortname() ?></span><span class="dot"></span>Next</a>
      </div>
    <?php endif ?>
  </div>
</main>

<?php snippet('footer') ?>
