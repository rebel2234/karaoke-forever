const db = require('sqlite')
const squel = require('squel')
const debug = require('debug')
const log = debug('app:media')

class Library {
  /**
  * Get artists and songs in a format suitable for sending to clients
  * as quickly as possible. Only lists one media item per song.
  * @return {Promise} Object with artist and media results
  */
  static async get () {
    const SongIdsByArtist = {}
    const artists = {
      result: [],
      entities: {}
    }
    const songs = {
      result: [],
      entities: {}
    }

    // query #1: songs
    try {
      const q = squel.select()
        .field('media.mediaId AS mediaId')
        .field('media.duration AS duration')
        .field('songs.artistId AS artistId')
        .field('songs.songId AS songId')
        .field('songs.title AS title')
        .field('MAX(media.isPreferred) AS isPreferred')
        .field('COUNT(media.mediaId) AS numMedia')
        .field('COUNT(DISTINCT stars.userId) AS numStars')
        .from('media')
        .join(squel.select()
          .from('paths')
          .field('MIN(paths.priority) AS priority')
          .field('pathId')
          .group('pathId'),
        'paths', 'media.pathId = paths.pathId')
        .join('songs USING (songId)')
        .join('artists USING (artistId)')
        .left_join('stars USING(songId)')
        .group('songs.songId')
        .order('songs.title')

      const { text, values } = q.toParam()
      const rows = await db.all(text, values)

      for (const row of rows) {
        // no need to send over the wire but we needed it
        // in the query to show the correct mediaId
        delete row.isPreferred

        // normalize song data
        songs.result.push(row.songId)
        songs.entities[row.songId] = row

        // add to artist's songIds
        if (typeof SongIdsByArtist[row.artistId] === 'undefined') {
          SongIdsByArtist[row.artistId] = []
        }

        SongIdsByArtist[row.artistId].push(row.songId)
      }
    } catch (err) {
      return Promise.reject(err)
    }

    // query #2: artists (we do this after songs so we can ignore
    // artists having no songs, e.g. when a provider is disabled)
    try {
      const q = squel.select()
        .from('artists')
        .order('name')

      const { text, values } = q.toParam()
      const rows = await db.all(text, values)

      for (const row of rows) {
        // don't include artists without any songs
        if (typeof SongIdsByArtist[row.artistId] === 'undefined') {
          log('continue')
          continue
        }

        // normalize artist data
        artists.result.push(row.artistId)
        artists.entities[row.artistId] = {
          ...row,
          songIds: SongIdsByArtist[row.artistId],
        }
      }
    } catch (err) {
      return Promise.reject(err)
    }

    return { artists, songs }
  }

  /**
  * Returns a single song (with the preferred mediaId)
  *
  * @param  {[type]}  songId
  * @return {Promise}        Song entity (same format as with get())
  */
  static async getSong (songId) {
    try {
      const q = squel.select()
        .field('media.mediaId AS mediaId')
        .field('media.duration AS duration')
        .field('songs.artistId AS artistId')
        .field('songs.songId AS songId')
        .field('songs.title AS title')
        .field('MAX(media.isPreferred) AS isPreferred')
        .field('COUNT(DISTINCT media.mediaId) AS numMedia')
        .field('COUNT(DISTINCT stars.userId) AS numStars')
        .from('media')
        .join(squel.select()
          .from('paths')
          .field('MIN(paths.priority) AS priority')
          .field('pathId')
          .group('pathId'),
        'paths', 'media.pathId = paths.pathId')
        .join('songs USING (songId)')
        .join('artists USING (artistId)')
        .left_join('stars USING(songId)')
        .group('songs.songId')
        .where('songs.songId = ?', songId)

      const { text, values } = q.toParam()
      const row = await db.get(text, values)

      // no need to send over the wire but we needed it
      // in the query to show the correct mediaId
      delete row.isPreferred

      return {
        [songId]: row,
      }
    } catch (err) {
      return Promise.reject(err)
    }
  }
}

module.exports = Library
