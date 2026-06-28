<?php snippet('header') ?>

<main>
  <header class="intro">
    <h1><?= $page->title() ?></h1>
  </header>
  <div class="text note">
    <?= $page->text()->kt() ?>
  
  <?php $tags = $page->children()->pluck('tags', ',', true); ?>
  <?php foreach($tags as $tag): ?>
    <h2><?= $tag ?></h2>
    <div class="toc">
    <?php foreach ($page->children()->listed()->filterBy('tags', $tag, ',') as $note): ?>
      <div class="toc-entry">
        <div class="toc-chapter"><a href="<?= $note->url() ?>"><?= $note->shortname() ?></a></div>
        <div class="toc-page"><a href="<?= $note->url() ?>"><time><?= $note->date()->toDate('M j') ?></time></a></div>
      </div>
    <?php endforeach ?>
    </div>
  <?php endforeach ?>
  </div>
</main>

<?php snippet('footer') ?>