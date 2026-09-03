<?php
/**
 * Plugin Name: YouMeOS High-Performance Object Cache
 * Description: High-speed persistent APCu and Redis object cache with runtime memory caching.
 * Version: 1.0.0
 * Author: Hall of the Gods, Inc.
 */

defined('ABSPATH') || exit;

function wp_cache_init() {
    $GLOBALS['wp_object_cache'] = new WP_YouMeOS_Object_Cache();
}

function wp_cache_add($key, $data, $group = '', $expire = 0) {
    return $GLOBALS['wp_object_cache']->add($key, $data, $group, (int) $expire);
}

function wp_cache_set($key, $data, $group = '', $expire = 0) {
    return $GLOBALS['wp_object_cache']->set($key, $data, $group, (int) $expire);
}

function wp_cache_get($key, $group = '', $force = false, &$found = null) {
    return $GLOBALS['wp_object_cache']->get($key, $group, $force, $found);
}

function wp_cache_delete($key, $group = '') {
    return $GLOBALS['wp_object_cache']->delete($key, $group);
}

function wp_cache_incr($key, $offset = 1, $group = '') {
    return $GLOBALS['wp_object_cache']->incr($key, $offset, $group);
}

function wp_cache_decr($key, $offset = 1, $group = '') {
    return $GLOBALS['wp_object_cache']->decr($key, $offset, $group);
}

function wp_cache_flush() {
    return $GLOBALS['wp_object_cache']->flush();
}

function wp_cache_flush_group($group) {
    return $GLOBALS['wp_object_cache']->flush_group($group);
}

function wp_cache_replace($key, $data, $group = '', $expire = 0) {
    return $GLOBALS['wp_object_cache']->replace($key, $data, $group, (int) $expire);
}

function wp_cache_add_global_groups($groups) {
    $GLOBALS['wp_object_cache']->add_global_groups($groups);
}

function wp_cache_add_non_persistent_groups($groups) {
    $GLOBALS['wp_object_cache']->add_non_persistent_groups($groups);
}

function wp_cache_switch_to_blog($blog_id) {
    $GLOBALS['wp_object_cache']->switch_to_blog($blog_id);
}

function wp_cache_supports($feature) {
    return in_array($feature, array('add_multiple', 'set_multiple', 'get_multiple', 'delete_multiple', 'flush_group'), true);
}

function wp_cache_get_multiple($keys, $group = '', $force = false) {
    return $GLOBALS['wp_object_cache']->get_multiple($keys, $group, $force);
}

function wp_cache_set_multiple(array $data, $group = '', $expire = 0) {
    return $GLOBALS['wp_object_cache']->set_multiple($data, $group, (int) $expire);
}

function wp_cache_delete_multiple(array $keys, $group = '') {
    return $GLOBALS['wp_object_cache']->delete_multiple($keys, $group);
}

class WP_YouMeOS_Object_Cache {
    private $cache = array();
    private $global_groups = array('users', 'userlogins', 'usermeta', 'user_meta', 'user_email', 'site-transient', 'site-options', 'blog-lookup', 'blog-id-cache', 'site-details');
    private $non_persistent_groups = array('comment', 'counts', 'plugins');
    private $blog_prefix = '';
    private $cache_prefix = '';
    private $backend = 'memory'; // 'apcu', 'redis', or 'memory'
    private $redis = null;

    public $cache_hits = 0;
    public $cache_misses = 0;

    public function __construct() {
        global $blog_id, $table_prefix;

        $this->blog_prefix = (string) ($blog_id ? $blog_id : 1);
        $this->cache_prefix = (defined('WP_CACHE_KEY_SALT') ? WP_CACHE_KEY_SALT : (string) $table_prefix) . ':';

        // 1. Check Redis backend
        $redis_host = getenv('WORDPRESS_REDIS_HOST') ?: getenv('REDIS_HOST') ?: (defined('WP_REDIS_HOST') ? WP_REDIS_HOST : null);
        if ($redis_host && class_exists('Redis')) {
            try {
                $redis_port = (int) (getenv('REDIS_PORT') ?: (defined('WP_REDIS_PORT') ? WP_REDIS_PORT : 6379));
                $client = new Redis();
                $connected = @$client->connect($redis_host, $redis_port, 1.5);
                if ($connected) {
                    $redis_pass = getenv('REDIS_PASSWORD') ?: (defined('WP_REDIS_PASSWORD') ? WP_REDIS_PASSWORD : null);
                    if ($redis_pass) {
                        @$client->auth($redis_pass);
                    }
                    $this->redis = $client;
                    $this->backend = 'redis';
                }
            } catch (Throwable $e) {
                $this->redis = null;
            }
        }

        // 2. Check APCu backend if Redis not active
        if ($this->backend === 'memory' && function_exists('apcu_fetch') && ini_get('apc.enabled')) {
            $this->backend = 'apcu';
        }
    }

    private function is_persistent($group) {
        return !in_array($group, $this->non_persistent_groups, true);
    }

    private function get_internal_key($key, $group) {
        $prefix = in_array($group, $this->global_groups, true) ? '' : $this->blog_prefix . ':';
        return $this->cache_prefix . $prefix . $group . ':' . (string) $key;
    }

    public function add($key, $data, $group = 'default', $expire = 0) {
        if (empty($group)) $group = 'default';
        if ($this->get($key, $group, false) !== false) {
            return false;
        }
        return $this->set($key, $data, $group, $expire);
    }

    public function set($key, $data, $group = 'default', $expire = 0) {
        if (empty($group)) $group = 'default';
        $internal_key = $this->get_internal_key($key, $group);

        if (is_object($data)) {
            $data = clone $data;
        }

        $this->cache[$group][$key] = $data;

        if ($this->is_persistent($group)) {
            if ($this->backend === 'apcu') {
                return (bool) apcu_store($internal_key, $data, (int) $expire);
            }
            if ($this->backend === 'redis' && $this->redis) {
                $serialized = serialize($data);
                if ($expire > 0) {
                    return (bool) $this->redis->setex($internal_key, (int) $expire, $serialized);
                }
                return (bool) $this->redis->set($internal_key, $serialized);
            }
        }

        return true;
    }

    public function get($key, $group = 'default', $force = false, &$found = null) {
        if (empty($group)) $group = 'default';

        if (!$force && isset($this->cache[$group]) && array_key_exists($key, $this->cache[$group])) {
            $this->cache_hits++;
            $found = true;
            $data = $this->cache[$group][$key];
            return is_object($data) ? clone $data : $data;
        }

        if ($this->is_persistent($group)) {
            $internal_key = $this->get_internal_key($key, $group);
            if ($this->backend === 'apcu') {
                $success = false;
                $data = apcu_fetch($internal_key, $success);
                if ($success) {
                    $this->cache_hits++;
                    $found = true;
                    $this->cache[$group][$key] = $data;
                    return is_object($data) ? clone $data : $data;
                }
            } elseif ($this->backend === 'redis' && $this->redis) {
                $stored = $this->redis->get($internal_key);
                if ($stored !== false && $stored !== null) {
                    $data = unserialize($stored);
                    $this->cache_hits++;
                    $found = true;
                    $this->cache[$group][$key] = $data;
                    return is_object($data) ? clone $data : $data;
                }
            }
        }

        $this->cache_misses++;
        $found = false;
        return false;
    }

    public function delete($key, $group = 'default') {
        if (empty($group)) $group = 'default';
        $internal_key = $this->get_internal_key($key, $group);

        unset($this->cache[$group][$key]);

        if ($this->is_persistent($group)) {
            if ($this->backend === 'apcu') {
                return (bool) apcu_delete($internal_key);
            }
            if ($this->backend === 'redis' && $this->redis) {
                return (bool) $this->redis->del($internal_key);
            }
        }

        return true;
    }

    public function incr($key, $offset = 1, $group = 'default') {
        if (empty($group)) $group = 'default';
        $val = $this->get($key, $group, true);
        if ($val === false || !is_numeric($val)) {
            return false;
        }
        $val += (int) $offset;
        if ($val < 0) $val = 0;
        $this->set($key, $val, $group);
        return $val;
    }

    public function decr($key, $offset = 1, $group = 'default') {
        return $this->incr($key, -$offset, $group);
    }

    public function replace($key, $data, $group = 'default', $expire = 0) {
        if (empty($group)) $group = 'default';
        if ($this->get($key, $group, false) === false) {
            return false;
        }
        return $this->set($key, $data, $group, $expire);
    }

    public function flush() {
        $this->cache = array();
        if ($this->backend === 'apcu') {
            return (bool) apcu_clear_cache();
        }
        if ($this->backend === 'redis' && $this->redis) {
            return (bool) $this->redis->flushDb();
        }
        return true;
    }

    public function flush_group($group) {
        unset($this->cache[$group]);
        if ($this->backend === 'apcu' && class_exists('APCUIterator')) {
            $pattern = '/^' . preg_quote($this->cache_prefix . $this->blog_prefix . ':' . $group . ':', '/') . '/';
            $iter = new APCUIterator($pattern);
            return (bool) apcu_delete($iter);
        }
        return true;
    }

    public function get_multiple($keys, $group = 'default', $force = false) {
        $results = array();
        foreach ($keys as $key) {
            $results[$key] = $this->get($key, $group, $force);
        }
        return $results;
    }

    public function set_multiple(array $data, $group = 'default', $expire = 0) {
        $results = array();
        foreach ($data as $key => $val) {
            $results[$key] = $this->set($key, $val, $group, $expire);
        }
        return $results;
    }

    public function delete_multiple(array $keys, $group = 'default') {
        $results = array();
        foreach ($keys as $key) {
            $results[$key] = $this->delete($key, $group);
        }
        return $results;
    }

    public function add_global_groups($groups) {
        $groups = (array) $groups;
        $this->global_groups = array_unique(array_merge($this->global_groups, $groups));
    }

    public function add_non_persistent_groups($groups) {
        $groups = (array) $groups;
        $this->non_persistent_groups = array_unique(array_merge($this->non_persistent_groups, $groups));
    }

    public function switch_to_blog($blog_id) {
        $this->blog_prefix = (string) ((int) $blog_id > 0 ? (int) $blog_id : 1);
    }
}
